/* eslint-disable react/display-name */
/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import QuizResults from './components/pages/QuizResults';
import zStore from './store/Store';
import { shallow } from 'zustand/shallow';
import parseData from './utils/ParseData';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import QuestionNode from './components/nodes/questions/QuestionNode';
import OptionNode from './components/nodes/options/OptionNode';
import Sidebar from './components/common/sidebar/Sidebar';
import CustomConnectionLine from './components/common/CustomConnectionLine';

import '@spectrum-css/vars/dist/spectrum-global.css';
import '@spectrum-css/vars/dist/spectrum-medium.css';
import '@spectrum-css/vars/dist/spectrum-dark.css';
import '@spectrum-css/tokens/dist/index.css';
import '@spectrum-css/page/dist/index-vars.css';
import '@spectrum-css/typography/dist/index.css';
import '@spectrum-css/icon/dist/index.css';
import '@spectrum-css/button/dist/index.css';
import '@spectrum-css/accordion/dist/index.css';
import '@spectrum-css/site/index.css';
import '@spectrum-css/fieldlabel/dist/index-vars.css';
import '@spectrum-css/fieldlabel/dist/index.css';
import '@spectrum-css/textfield/dist/index.css';
import '@spectrum-css/textfield/dist/index-vars.css';
import 'reactflow/dist/style.css';
import Debugger from './components/pages/Debugger';
import { performValidations } from './utils/utils';

let id = 1;
const getId = () => `node${id++}`;

const nodeWidth = 172;
const nodeHeight = 36;

const layoutGraph = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const ranksep = 100;
  const nodesep = 200;

  dagreGraph.setGraph({ rankdir: direction, ranksep: ranksep, nodesep: nodesep });

  nodes.forEach(node => {
    let width = nodeWidth;
    let height = nodeHeight;
    if (node.type === 'question') {
      height += 1500;
    }

    dagreGraph.setNode(node.id, { width: width, height: height });
  });
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 },
    };
  });
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
};

const fetchFile = async (baseUrl, fileName) => {
  const response = await fetch(`${baseUrl}${fileName}`);
  if (!response.ok) {
    throw new Error(`Error fetching ${fileName}: ${response.statusText}`);
  }
  return response.json();
};

const QuizEditor = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = zStore(state => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }), shallow);

  const [parsedNodes, setParsedNodes] = useState([]);
  const [parsedEdges, setParsedEdges] = useState([]);

  const reactFlowInstance = useReactFlow();
  const [initialView, setInitialView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const [baseUrl, setBaseUrl] = useState('');

  const importData = async (importBaseUrl) => {
    try {
      const questionsData = await fetchFile(importBaseUrl, 'questions.json');
      const stringsData = await fetchFile(importBaseUrl, 'strings.json');
      const resultsData = await fetchFile(importBaseUrl, 'results.json');

      zStore.getState().setData(stringsData, questionsData, resultsData);
      const validationResults = performValidations(questionsData, stringsData);
      zStore.getState().setValidationResults(validationResults);
      
      const { nodes: importedNodes, edges: importedEdges } = parseData(questionsData, stringsData);
      const layoutedNodes = layoutGraph(importedNodes, importedEdges);
  
      setParsedNodes(layoutedNodes);
      setParsedEdges(importedEdges);
      setNodes(layoutedNodes);
      setEdges(importedEdges);

      zStore.getState().setResultsData(resultsData);
      zStore.getState().setBaseUrl(importBaseUrl);

      // console.log('imported nodes', importedNodes);
      // console.log('imported edges', importedEdges);

    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  useEffect(() => {
    setNodes(parsedNodes);
    setEdges(parsedEdges);
  }, [parsedNodes, parsedEdges, setNodes, setEdges]);

  const updateLayout = () => {
    const layoutedNodes = layoutGraph(nodes, edges);
    setNodes(layoutedNodes);
  };

  const handleDoubleClick = useCallback(
    (event, node) => {
      if (reactFlowInstance && reactFlowInstance.viewport && !isZoomedIn) {
        setInitialView({
          x: reactFlowInstance.viewport.x,
          y: reactFlowInstance.viewport.y,
          zoom: reactFlowInstance.viewport.zoom
        });
        const newX = -node.__rf.position.x + window.innerWidth / 2;
        const newY = -node.__rf.position.y + window.innerHeight / 2;
        reactFlowInstance.setViewport({ x: newX, y: newY, zoom: 2 });
        setIsZoomedIn(true);
      } else if (reactFlowInstance) {
        reactFlowInstance.setViewport(initialView);
        setIsZoomedIn(false);
      }
    },
    [isZoomedIn, initialView, reactFlowInstance]
  );
  
  const nodeTypes = useMemo(() => ({
    question: (nodeProps) => <QuestionNode {...nodeProps} setNodes={setNodes} setEdges={setEdges} />,
    option: (nodeProps) => <OptionNode {...nodeProps} setNodes={setNodes} setEdges={setEdges} />,
  }), [setNodes, setEdges]);

  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const connectingHandleId = useRef(null);
  const { project } = useReactFlow();

  const onConnectStart = useCallback((event, { nodeId, handleId }) => {
    connectingNodeId.current = nodeId;
    connectingHandleId.current = handleId;
  }, []);

  const isChildNode = (nodeId) => {
    return edges.some(edge => edge.target === nodeId);
  };

  const getParentNodeId = (childNodeId) => {
    const edge = edges.find(edge => edge.target === childNodeId);
    return edge ? edge.source : null;
  };

  const onConnectEnd = useCallback(
    (event) => {
      if (event.target.classList.contains('react-flow__pane')) {
        const newId = getId();
        let newNodeType, newNodeData;

        switch (connectingHandleId.current) {
          case 'newOption':
            newNodeType = 'option';
            newNodeData = { label: `Option ${newId}` };
            break;
          case 'grey':
            newNodeType = 'question';
            newNodeData = { label: `Question ${newId}`, product1: '', product2: '' };
            break;
          default:
            return;
        }

        let position = project({
          x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
          y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top
        });

        const newNode = {
          id: newId,
          type: newNodeType,
          data: newNodeData,
          position: position
        };

        const updatedNodes = [...nodes, newNode];
        // Uncomment out next 2 lines to activate auto layout work.
        // const layoutedNodes = layoutGraph(updatedNodes, edges);
        // setNodes(layoutedNodes);

        if (connectingNodeId.current) {
          const newEdge = {
            id: `e${connectingNodeId.current}-${newId}`,
            source: connectingNodeId.current,
            target: newId,
            sourceHandle: connectingHandleId.current,
            className: '',
            style: { stroke: zStore.getState().getEdgeStyle(connectingHandleId.current).stroke }
          };
          zStore.getState().addNode(newNode);
          zStore.getState().onConnect(newEdge);
        }
      }
    },
    [nodes, edges, setNodes, project]
  );

  const addQuestion = () => {
    const newId = getId();
    const newNode = {
      id: newId,
      type: 'question',
      data: { label: `Question ${newId}`, product1: '', product2: '' },
      position: { x: id * 450, y: 100 },
    };
    zStore.getState().addNode(newNode);
  };


  const convertJsonToXlsx = (jsonData, outputFileName) => {
    const wb = XLSX.utils.book_new();
  
    Object.keys(jsonData).forEach(key => {
      if (!key.startsWith(":") && Array.isArray(jsonData[key].data)) {
        const ws = XLSX.utils.json_to_sheet(jsonData[key].data);
        XLSX.utils.book_append_sheet(wb, ws, key);
      }
    });
  
    const wbout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});
    const blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'});
    saveAs(blob, outputFileName);
  };
  
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const exportData = () => {
    const { nodes, edges } = zStore.getState();
    // console.log('exported nodes', nodes);
    // console.log('exported edges', edges);
    function createDynamicResultsJsonStructure(questionKeys, resultFragmentsKeys, resultDestinationKeys) {
      const createDataEntry = (keys) => keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {});
  
      return {
        "helix-result": {
          "data": Array(nodes.filter(node => node.type === 'question').length).fill().map(() => ({
        ...createDataEntry(questionKeys),
        "result-primary": "",
        "result-secondary": ""
          }))
        },
        "helix-result-fragments": {
          "data": Array(resultFragmentsKeys.length).fill().map(() => createDataEntry(resultFragmentsKeys))
        },
        "helix-result-destination": {
          "data": Array(resultDestinationKeys.length).fill().map(() => createDataEntry(resultDestinationKeys))
        },
        ":names": [
          "helix-result",
          "helix-result-fragments",
          "helix-result-destination"
        ],
        ":type": "multi-sheet"
      };
    }
    const questionKeys = nodes.filter(node => node.type === 'question').map(node => node.data.customID);
    // console.log('questionKeys', questionKeys);

    const resultFragmentsKeys = ["product", "marquee", "card-list", "commerce-card", "marquee-product-single", "marquee-product-cc", "master-plan", "learn", "value-prop", "check-bullet", "media", "templates"];
    const resultDestinationKeys = ["result", "umbrella-result", "url", "basic-fragments", "nested-fragments-primary", "nested-fragments-secondary"];
    const resultsJsonStructure = createDynamicResultsJsonStructure(questionKeys, resultFragmentsKeys, resultDestinationKeys);

    const questionsData = generateQuestionsData(nodes, edges);
    const stringsData = generateStringsData(nodes, edges);

    // console.log('questionsData', questionsData);
    // console.log('stringsData', stringsData);
    // console.log('resultsJsonStructure', resultsJsonStructure);

    convertJsonToXlsx(questionsData, 'questions.xlsx');
    convertJsonToXlsx(stringsData, 'strings.xlsx');
    convertJsonToXlsx(resultsJsonStructure, 'results.xlsx');
  };
  const generateQuestionsData = (nodes, edges) => {
    const questionsSummary = nodes.filter(node => node.type === 'question').map(qNode => ({
        questions: qNode.data.customID, // Assuming customID is part of the data object
        "min-selections": qNode.data.minSelection ?? "1",
        "max-selections": qNode.data.maxSelections ?? "1"
    }));
    
    const questionsData = {
        questions: {
            total: questionsSummary.length,
            offset: 0,
            limit: questionsSummary.length,
            data: questionsSummary
        }
    };

    nodes.filter(n => n.type === 'question').forEach(qNode => {
        const qKey = qNode.data.customID; // Assuming customID is part of the data object
        questionsData[qKey] = {
            total: edges.filter(e => e.source === qNode.id).length, // Ensure this references the node's internal ID as it's used in the edges array
            offset: 0,
            limit: edges.filter(e => e.source === qNode.id).length,
            data: edges.filter(e => e.source === qNode.id).map(e => ({
                options: e.target,
                next: nodes.find(n => n.id === e.target)?.data.next || "RESULT",
            }))
        };
    });

    return questionsData;
};
  const generateStringsData = (nodes, edges) => {
    // Mapping over all nodes of type 'question' to create the data structure for strings
    const stringsSummary = nodes.filter(node => node.type === 'question').map(qNode => ({
      q: qNode.data.customID, // Assuming customID is what you want to display in the 'q' column
      heading: qNode.data.label,
      "sub-head": qNode.data.subtitle,
      btn: qNode.data.btnLabel,
      background: qNode.data.backgroundImage,
      footerFragment: qNode.data.footerFragment
    }));
  
    const stringsData = {
      questions: {
        total: stringsSummary.length,
        offset: 0,
        limit: stringsSummary.length,
        data: stringsSummary
      }
    };
  
    nodes.filter(n => n.type === 'question').forEach(qNode => {
      const optionsData = edges.filter(e => nodes.find(n => n.data.customID === qNode.data.customID)?.id === e.source);
      stringsData[qNode.data.customID] = {
        total: optionsData.length,
        offset: 0,
        limit: optionsData.length,
        data: optionsData.map(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          // Ensure we're getting the right properties from the targetNode
          return {
            options: targetNode.data.customID || edge.target, // Fallback to edge target ID if customID is not present
            title: targetNode.data.label || '',
            text: targetNode.data.text || '',
            icon: targetNode.data.icon || '',
            image: targetNode.data.image || ''
          };
        })
      };
    });
  
    return stringsData;
  };

  const resultsData = zStore(state => state.resultsData);

  return (
    <div className="wrapper flex" ref={reactFlowWrapper} style={{ height: '100vh' }}>
      <Sidebar
        addQuestion={addQuestion}
        onImportData={importData}
        exportData={exportData}
      />
      <div className="main-body">
        <Router>
          <div className="wrapper flex" style={{ height: '100vh' }}>
            <div className="main-body">
              <sp-top-nav class="top-nav">
                <Link to="/">
                  <sp-top-nav-item>
                    Visual Authoring
                  </sp-top-nav-item>
                </Link>
                <Link to="/quiz-results">
                  <sp-top-nav-item>
                    Quiz Results
                  </sp-top-nav-item>
                </Link>
                <Link to="/debugger">
                  <sp-top-nav-item>
                    Debugger
                  </sp-top-nav-item>
                </Link>
              </sp-top-nav>

              <Routes>
                <Route path="/quiz-results" element={<QuizResults resultsData={resultsData} />} />
                <Route path="/debugger" element={<Debugger />} />
                <Route path="/" element={
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    panOnScroll
                    selectionOnDrag
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    elementsSelectable={true}
                    connectionLineComponent={(props) => <CustomConnectionLine {...props} />}
                    onNodeDoubleClick={handleDoubleClick}
                    zoomOnDoubleClick={false}
                  >
                    <Background color="#aaa" gap={20} />
                    <MiniMap
                      nodeColor={(n) => {
                        if (n.type === "question") return "#ccc";
                        if (n.type === "option") return "pink";
                        if (n.type === "default") return "#ccc";
                        return "#eee";
                      }}
                      nodeBorderRadius={2}
                      pannable={true}
                      zoomable={true}
                    />
                    <Controls />
                  </ReactFlow>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </div>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <QuizEditor />
  </ReactFlowProvider>
);


