import React from 'react';

const ValidateQuesions = ({ validations }) => {
    return (
        <div>
            <h2>Quiz Validation</h2>
            {validations.map((validation, index) => (
                <div key={index} className={`spectrum-InLineAlert spectrum-InLineAlert--${validation.type}`}>
                    <div className="spectrum-InLineAlert-header">
                        {validation.title}
                        <svg className="spectrum-Icon spectrum-Icon--sizeM spectrum-InLineAlert-icon" focusable="false" aria-hidden="true">
                            <use xlinkHref={`#spectrum-icon-18-${validation.icon}`} />
                        </svg>
                    </div>
                    <div className="spectrum-InLineAlert-content">{validation.message}</div>
                </div>
            ))}
        </div>
    )
}

export default ValidateQuesions;