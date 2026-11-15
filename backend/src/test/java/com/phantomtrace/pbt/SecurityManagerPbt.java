package com.phantomtrace.pbt;

import com.phantomtrace.ai.agent.SecurityManager;
import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.StringLength;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityManagerPbt {

    private final SecurityManager securityManager = new SecurityManager();

    @Property
    void sanitizeUserInputAlwaysEnforcesBoundsAndInvariants(@ForAll @StringLength(max = 50000) String input) {
        String result = securityManager.sanitizeUserInput(input);

        // Invariant 1: Result is never null
        assertThat(result).isNotNull();

        // Invariant 2: Output length never exceeds 24,000 characters
        assertThat(result.length()).isLessThanOrEqualTo(24000);

        // Invariant 3: Output never contains null bytes
        assertThat(result).doesNotContain("\u0000");

        // Invariant 4: Output never contains unescaped markdown code fences (```)
        assertThat(result).doesNotContain("```");
    }

    @Property
    void sanitizeUserInputHandlesNullGracefully() {
        String result = securityManager.sanitizeUserInput(null);
        assertThat(result).isEqualTo("");
    }
}

