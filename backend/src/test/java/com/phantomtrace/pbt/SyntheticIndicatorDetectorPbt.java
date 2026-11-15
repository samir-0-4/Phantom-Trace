package com.phantomtrace.pbt;

import com.phantomtrace.util.SyntheticIndicatorDetector;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import net.jqwik.api.Combinators;
import net.jqwik.api.Example;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Provide;
import net.jqwik.api.constraints.IntRange;

import static org.assertj.core.api.Assertions.assertThat;

class SyntheticIndicatorDetectorPbt {

    @Property
    void rfc5737TestNet1IsAlwaysSynthetic(@ForAll @IntRange(min = 0, max = 255) int lastOctet) {
        String ip = "192.0.2." + lastOctet;
        assertThat(SyntheticIndicatorDetector.isRfc5737TestNetIp(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("http://" + ip + "/phish")).isTrue();
    }

    @Property
    void rfc5737TestNet2IsAlwaysSynthetic(@ForAll @IntRange(min = 0, max = 255) int lastOctet) {
        String ip = "198.51.100." + lastOctet;
        assertThat(SyntheticIndicatorDetector.isRfc5737TestNetIp(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("https://" + ip + ":8080/path")).isTrue();
    }

    @Property
    void rfc5737TestNet3IsAlwaysSynthetic(@ForAll @IntRange(min = 0, max = 255) int lastOctet) {
        String ip = "203.0.113." + lastOctet;
        assertThat(SyntheticIndicatorDetector.isRfc5737TestNetIp(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(ip)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("admin@" + ip)).isTrue();
    }

    @Property
    void rfc2606SpecialUseTldsAreAlwaysSynthetic(
            @ForAll("rfc2606Tlds") String tld,
            @ForAll("domainPrefixes") String prefix) {
        String domain = prefix + "." + tld;
        assertThat(SyntheticIndicatorDetector.isExplicitTestTldOrNamespace(domain)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(domain)).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("https://" + domain + "/login")).isTrue();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("user@" + domain)).isTrue();
    }

    @Property
    void exampleEduIsNeverSyntheticOrReserved(
            @ForAll("optionalSubdomain") String sub) {
        String domain = sub.isEmpty() ? "example.edu" : sub + ".example.edu";
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(domain)).isFalse();
        assertThat(SyntheticIndicatorDetector.isReservedExampleDomain(domain)).isFalse();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator("https://" + domain + "/portal")).isFalse();
    }

    @Property
    void publicIpsAreNeverSynthetic(
            @ForAll @IntRange(min = 1, max = 191) int octet1,
            @ForAll @IntRange(min = 0, max = 255) int octet2,
            @ForAll @IntRange(min = 0, max = 255) int octet3,
            @ForAll @IntRange(min = 1, max = 254) int octet4) {
        // Exclude RFC 5737 ranges (192.0.2.x, 198.51.100.x, 203.0.113.x) - octet1 < 192 guarantees exclusion
        String ip = octet1 + "." + octet2 + "." + octet3 + "." + octet4;
        assertThat(SyntheticIndicatorDetector.isRfc5737TestNetIp(ip)).isFalse();
        assertThat(SyntheticIndicatorDetector.isSyntheticIndicator(ip)).isFalse();
    }

    @Provide
    Arbitrary<String> rfc2606Tlds() {
        return Arbitraries.of("test", "invalid", "localhost", "example");
    }

    @Provide
    Arbitrary<String> domainPrefixes() {
        return Arbitraries.strings().alpha().ofMinLength(2).ofMaxLength(15);
    }

    @Provide
    Arbitrary<String> optionalSubdomain() {
        return Arbitraries.strings().alpha().ofMinLength(0).ofMaxLength(10);
    }
}

