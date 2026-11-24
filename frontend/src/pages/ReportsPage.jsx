import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FullPageSpinner } from '../components/ui/Spinner';
import { investigationService } from '../services/investigation/investigationService';
import { getApiErrorMessage } from '../services/api/apiClient';
import { formatDate, titleCase } from '../utils/format';
import '../styles/report.css';

export const ReportsPage = () => {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    investigationService
      .list({ size: 50 })
      .then((page) => {
        if (active) setInvestigations(page?.content || []);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, 'Could not load investigations.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (loading) return <FullPageSpinner label="Loading investigations…" />;

  return (
    <div className="report-manifest">
      <header className="report-manifest-header">
        <h1 className="page-heading">Investigation Reports</h1>
        <p className="page-lede">Open a case to generate, review, or print its forensic dossier.</p>
      </header>

      {error ? (
        <div role="alert" className="report-alert">
          <AlertCircle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : investigations.length === 0 ? (
        <section className="workstation-panel report-empty">
          <FileText size={24} aria-hidden="true" />
          <h2>No investigations yet</h2>
          <p>Create an investigation before generating a report.</p>
          <Link to="/investigations/new" className="text-link">
            <Plus size={16} aria-hidden="true" />
            Create Investigation
          </Link>
        </section>
      ) : (
        <section className="workstation-panel report-manifest-list" aria-labelledby="case-manifest-heading">
          <div className="report-manifest-listhead">
            <h2 id="case-manifest-heading">Case manifest</h2>
            <p>{investigations.length} {investigations.length === 1 ? 'case' : 'cases'} listed</p>
          </div>
          <div className="report-manifest-columns report-manifest-grid" aria-hidden="true">
            <span>Investigation</span>
            <span>Category</span>
            <span>Evidence</span>
            <span>Case opened</span>
            <span />
          </div>
          <ul role="list">
            {investigations.map((investigation) => {
              const evidenceCount = investigation.evidenceCount ?? 0;

              return (
                <li key={investigation.id}>
                  <Link
                    to={`/investigations/${investigation.id}/report`}
                    className="report-manifest-row report-manifest-grid"
                    aria-labelledby={`report-action-${investigation.id} report-case-${investigation.id}`}
                  >
                    <span className="report-manifest-case">
                      <FileText size={18} aria-hidden="true" />
                      <span className="report-manifest-name">
                        <strong id={`report-case-${investigation.id}`}>{investigation.title}</strong>
                        {investigation.syntheticDemo && <span className="report-demo-label">Synthetic demo</span>}
                      </span>
                    </span>
                    <span className="report-manifest-category">{titleCase(investigation.category) || 'Unknown'}</span>
                    <span className="report-manifest-evidence">
                      {evidenceCount}
                      <span className="report-manifest-evidence-label">
                        {' '}<span className="report-manifest-mobile-label">evidence </span>
                        {evidenceCount === 1 ? 'item' : 'items'}
                      </span>
                    </span>
                    <time className="report-manifest-date" dateTime={investigation.createdAt || undefined}>
                      <span className="report-manifest-mobile-label">Opened </span>
                      {formatDate(investigation.createdAt)}
                    </time>
                    <span className="report-manifest-action" id={`report-action-${investigation.id}`}>
                      View report <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ReportsPage;
