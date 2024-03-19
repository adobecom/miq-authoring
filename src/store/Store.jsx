import create from 'zustand';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';

const initialNodes = [];
const initialEdges = [];
const initialValidationResults = [];
const stringsData = [];
const questionsData = [];
const resultsData = [];

const getEdgeStyle = (handleId) => {
  switch (handleId) {
    case 'newOption':
      return { stroke: 'orange', labelText: 'New Option' };
    case 'newQuestion':
      return { stroke: 'white', labelText: 'New Question' };
    case 'not':
      return { stroke: 'red', labelText: 'NOT' };
    case 'nextQuestion':
      return { stroke: 'green', labelText: 'Next Question' };
    default:
      return { stroke: 'white', labelText: '' };
  }
};
const zStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  setBaseUrl: (newBaseUrl) => set({ baseUrl: newBaseUrl }),

  setData: ({ stringsData, questionsData, newResultsData }) => set(() => ({ stringsData, questionsData, newResultsData })),
  setResultsData: (newResultsData) => set(() => ({ resultsData: newResultsData })),
  setValidationResults: (newValidationResults) => set(() => ({ validationResults: newValidationResults })), 
  setValidationQuizResults: (newValidationQuizResults) => set(() => ({ validationQuizResults: newValidationQuizResults })), 
  
  setNodes: (newNodes) => set({ nodes: newNodes }),
  setEdges: (newEdges) => set({ edges: newEdges }),

  getEdgeStyle: (handleId) => {
    return getEdgeStyle(handleId);
  },

  addNode: (newNode) => {
    const currentNodes = get().nodes;
    const newNodeWithCustomID = {
      ...newNode,
      customID: newNode.id // or another value as needed
    };
    set({ nodes: [...currentNodes, newNodeWithCustomID] });
  },


  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  updateNodeData: (nodeId, newData) => {
    set((state) => {
      const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId || n.data.customID === nodeId);
      if (nodeIndex === -1) return;
      
      const updatedNodes = state.nodes.map((node, index) => {
        if (index === nodeIndex) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      });
      return { nodes: updatedNodes };
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const { sourceHandle } = connection;
    const { stroke } = getEdgeStyle(sourceHandle);
    const sourceNode = get().nodes.find(n => n.id === connection.source);
    const targetNode = get().nodes.find(n => n.id === connection.target);
  
    const newEdge = {
      ...connection,
      id: `e${sourceNode.data.customID}-${targetNode.data.customID}`, // Use customID for edge id
      className: 'animated',
      style: { stroke: stroke },
    };
    set((state) => ({
      edges: addEdge(newEdge, state.edges),
    }));
  },

  validationResults: initialValidationResults,
  // setValidationResults: (results) => set({ validationResults: results }),
}));

export default zStore;
