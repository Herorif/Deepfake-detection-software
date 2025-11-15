import React from 'react';

const ApiReasoning = ({ reasoning }) => {
  return (
    <div className="api-reasoning-always">
      <div className="reasoning-header">
        <h4>AI Model Analysis</h4>
        <div className="ai-badge">AI Reasoning</div>
      </div>
      <div className="reasoning-content">
        <div className="reasoning-text">
          {reasoning || 'The AI model is analyzing the media content for deepfake indicators. Detailed reasoning will appear here once the analysis is complete.'}
        </div>
      </div>
    </div>
  );
};

export default ApiReasoning;