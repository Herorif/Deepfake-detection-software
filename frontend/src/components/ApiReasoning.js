import React from 'react';

const ApiReasoning = ({
  summary,
  attackVectors = [],
  recommendations = [],
  riskLevel,
  finalVerdict,
  scoreSummary,
}) => (
  <div className="ai-reasoning-panel">
    <div className="reasoning-header">
      <div className="header-main">
        <h3>AI Model Analysis Report</h3>
        <p>Insights from EfficientNetV2 detector and local Ollama reasoning</p>
      </div>
      <div className="header-pills">
        {finalVerdict && <span className="reasoning-pill verdict-pill">{finalVerdict.replace('_', ' ')}</span>}
        {riskLevel && <span className={`reasoning-pill risk-pill-${riskLevel}`}>{riskLevel} risk</span>}
      </div>
    </div>
    <div className="reasoning-content">
      {scoreSummary && <p className="score-summary">{scoreSummary}</p>}
      <div className="reasoning-text">
        {summary || 'Upload media to receive a threat summary and recommendations.'}
      </div>
      {attackVectors.length > 0 && (
        <div className="reasoning-vectors">
          <h4>Attack Vectors</h4>
          <ul>
            {attackVectors.map((vector) => (
              <li key={vector.id || vector.name}>
                <strong>{vector.name}</strong>: {vector.description} (impact: {vector.impact})
              </li>
            ))}
          </ul>
        </div>
      )}
      {recommendations.length > 0 && (
        <div className="reasoning-recommendations">
          <h4>Recommendations</h4>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={`${rec}-${index}`}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default ApiReasoning;
