import React from 'react';

const ApiReasoning = ({ reasoning }) => {
  return (
    <div className="ai-reasoning-panel">
      <div className="reasoning-header">
        <div className="header-main">
          <h3>AI Model Analysis Report</h3>
          <p>Detailed reasoning and insights from the deepfake detection analysis</p>
        </div>
 
      </div>
      <div className="reasoning-content">
        <div className="reasoning-text">
          {reasoning || 'The AI model is processing the media content. Detailed analysis and reasoning will be displayed here once the verification is complete.'}
        </div>
      </div>
    </div>
  );
};

export default ApiReasoning;