/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import './QuestionNode.css'
import zStore from '../../../store/Store.jsx';


const QuestionNode = memo(({ id, data, isConnectable }) => {

    // console.log(data, 'data in QuestionNode');

    const updateNodeData = zStore((state) =>  state.updateNodeData);

    const onInputChange = (fieldName) => (event) => {
        console.log('onInputChange happening');
        const value = event.target.value;
        // console.log('value', value);
        updateNodeData(id, { [fieldName]: value });
    };
    
    return (
        <>
            <div className="question">
                <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} isConnectable={isConnectable} />
                <div style={{ height: '370px', width: '400px', padding: '20px', background: 'rgb(29, 29, 29, 0.8)', border: '1px solid #rgb(29, 29, 29)', borderRadius: '15px', display: 'grid' }}>
                    <h3 className="spectrum-Heading spectrum-Heading--sizeM">Question {data.customID} </h3>
                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-id">Question ID</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                            <sp-textfield id="node-custom-id" placeholder="Custom ID" value={data.customID || ''} onInput={onInputChange('customID')}></sp-textfield>
                            </div>
                        </div>
                    </div>
                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-title">Title</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                                <sp-textfield id="node-q-title" placeholder="What do you want to do today?" value={data.label} onInput={onInputChange('label')}></sp-textfield>
                            </div>
                        </div>
                    </div>
                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-subtitle">Subtitle</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                                <sp-textfield id="node-q-subtitle" placeholder="Pick up to 3" value={data.subtitle} onInput={onInputChange('subtitle')}></sp-textfield>
                            </div>
                        </div>
                    </div>

                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-btn">Button Label</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                                <sp-textfield id="node-q-btn" placeholder="Next" value={data.btnLabel} onInput={onInputChange('btnLabel')}></sp-textfield>
                            </div>
                        </div>
                    </div>


                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-imagebg">Background Image URL</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                                <sp-textfield id="node-q-imagebg" placeholder="https://" value={data.backgroundImage} onInput={onInputChange('backgroundImage')}></sp-textfield>
                            </div>
                        </div>
                    </div>

                    <div className="spectrum-Form-item">
                        <label className="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--left" htmlFor="node-q-min-sel">Min Selections</label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Stepper">
                                <div className="spectrum-Textfield spectrum-Stepper-textfield">
                                    <sp-number-field value={data.minSelections || "1"} label="Size" size="m" style={{ "--spectrum-stepper-width": "110px" }} onInput={onInputChange('minSelection')}></sp-number-field>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="spectrum-Form-item">
                        <label className="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--left" htmlFor="node-q-max-sel">Max Selections</label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Stepper">
                                <div className="spectrum-Textfield spectrum-Stepper-textfield">
                                    <sp-number-field label="Size" value={data.maxSelections || "3"}  size="m" style={{ "--spectrum-stepper-width": "110px" }} onInput={onInputChange('maxSelections')}></sp-number-field>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="spectrum-Form-item">
                        <sp-field-label class="spectrum-FieldLabel spectrum-FieldLabel--sizeM spectrum-Form-itemLabel spectrum-FieldLabel--right" for="node-q-footerFrag">Footer Fragment URL</sp-field-label>
                        <div className="spectrum-Form-itemField">
                            <div className="spectrum-Textfield">
                                <sp-textfield id="node-q-footerFrag" placeholder="https://" value={data.footerFragment} onInput={onInputChange('footerFragment')}></sp-textfield>
                            </div>
                        </div>
                    </div>
                </div>

                <Handle id="grey" type="source" position={Position.Right} className="newNode" isConnectable={isConnectable} />
                <Handle id="newOption" type="source" position={Position.Bottom} className="newNode newOption" isConnectable={isConnectable} />
            </div>
        </>
    );
});

export default memo(QuestionNode);