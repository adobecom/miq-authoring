const parseData = (questionsData, stringsData) => {
    const nodes = [];
    const edges = [];
    questionsData.questions.data.forEach(question => {
        const questionStringData = stringsData.questions.data.find(q => q.q === question.questions);
        if (!questionStringData) {
            console.error(`No string data found for question ID: ${question.questions}`);
            // Handle the missing data appropriately, perhaps skip this iteration
            return;
        }
        const questionNode = {
            id: question.questions, // Ensure this ID is the one you want to use
            customID: question.questions,
            type: 'question',
            data: {
                customID: question.questions,
                label: questionStringData.heading, // Assuming 'heading' is correct
                subtitle: questionStringData['sub-head'], // Check for correct property name
                btnLabel: questionStringData.btn, // And so on...
                backgroundImage: questionStringData.background,
                footerFragment: questionStringData.footerFragment,
                minSelections: question['min-selections'], // Ensure these properties exist
                maxSelections: question['max-selections'] // in your questionsData
            },
            position: { x: 100, y: 100 }
        };
        nodes.push(questionNode);

        const optionsData = questionsData[question.questions];
        optionsData?.data.forEach(option => {
            const optionStringData = stringsData[option.options] || {};
            const iconUrl = optionStringData.icon || optionStringData['icon-tablet'] || optionStringData['icon-desktop'];

            const optionNode = {
                id: option.options,
                type: 'option',
                data: {
                    label: optionStringData.title || '',
                    text: optionStringData.text || '',
                    image: optionStringData.image || '',
                    icon: iconUrl,
                    next: option.next || '',
                    reset: option.next?.includes('RESET'),
                    result: option.next?.includes('RESULT'),
                },
                position: { x: 300, y: 300 }
            };
            nodes.push(optionNode);

            edges.push({
                id: `e${question.questions}-${option.options}`,
                source: question.questions,
                target: option.options,
                sourceHandle: 'newOption',
                targetHandle: null,
                style: { stroke: 'defaultColor' }
            });

            const nextSteps = option.next.split(',').filter(Boolean);
            nextSteps.forEach(nextStep => {
                if (nextStep.includes('NOT(')) {
                    const target = nextStep.match(/\(([^)]+)\)/)[1];
                    edges.push({
                        id: `e${option.options}-not-${target}`,
                        source: option.options,
                        target: target,
                        sourceHandle: 'not',
                        targetHandle: 'nextQuestion',
                        style: { stroke: 'defaultColor' }
                    });
                } else {
                    edges.push({
                        id: `e${option.options}-${nextStep}`,
                        source: option.options,
                        target: nextStep,
                        sourceHandle: 'nextQuestion',
                        targetHandle: 'nextQuestion',
                        style: { stroke: 'defaultColor' }
                    });
                }
            });
        });
    });

    return { nodes, edges };
};

export default parseData;