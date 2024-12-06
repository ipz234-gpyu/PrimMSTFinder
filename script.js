let graphNodes = [];
let edges = [];
let selectedAction = null;
let selectedNode = null;
const board = d3.select("#board");
let lastIndex = 1;
let result = 0;

document.getElementById("addGraphBtn").addEventListener("click", () => {
    selectedAction = selectedAction === "addGraph" ? null : "addGraph";
    toggleActiveButton("addGraphBtn");
});

document.getElementById("addEdgeBtn").addEventListener("click", () => {
    selectedAction = selectedAction === "addEdge" ? null : "addEdge";
    if(selectedNode !== null) {
        updateNodeColor(selectedNode.id, "skyblue");
        selectedNode = null;
    }
    toggleActiveButton("addEdgeBtn");
});

document.getElementById("deleteBtn").addEventListener("click", () => {
    selectedAction = selectedAction === "delete" ? null : "delete";
    toggleActiveButton("deleteBtn");
});

document.getElementById("runPrimBtn").addEventListener("click", runPrim);

document.getElementById("clearBtn").addEventListener("click", clearBoard);

function toggleActiveButton(buttonId) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.id === buttonId) {
            button.classList.toggle('active');
        } else {
            button.classList.remove('active');
        }
    });
}

board.on("click", function (event) {
    if (selectedAction === "addGraph") {
        const coords = d3.pointer(event);
        const newNode = { x: coords[0], y: coords[1], id: lastIndex };
        lastIndex++;
        graphNodes.push(newNode);
        renderGraph();
    } else if (selectedAction === "addEdge") {
        const clickedNode = findNodeByCoords(d3.pointer(event));

        if (selectedNode && clickedNode && clickedNode !== selectedNode) {
            const weight = prompt("Введіть вагу для цього ребра:", "1");

            if (weight !== null && !isNaN(weight) && weight > 0) {
                const existingEdgeIndex = edges.findIndex(edge =>
                    (edge.source === selectedNode && edge.target === clickedNode) ||
                    (edge.source === clickedNode && edge.target === selectedNode)
                );

                if (existingEdgeIndex !== -1) {
                    edges.splice(existingEdgeIndex, 1);
                }

                const newEdge = { source: selectedNode, target: clickedNode, weight: parseInt(weight) };
                edges.push(newEdge);

                updateNodeColor(selectedNode.id, "skyblue");
                selectedNode = null;
                renderGraph();
            }
        } else if (clickedNode) {
            selectedNode = clickedNode;
            updateNodeColor(selectedNode.id, "orange");
        } else {
            if (selectedNode) {
                updateNodeColor(selectedNode.id, "skyblue");
                selectedNode = null;
            }
        }
    } else if (selectedAction === "delete") {
        const clickedNode = findNodeByCoords(d3.pointer(event));
        if (clickedNode) {
            edges = edges.filter(edge => edge.source !== clickedNode && edge.target !== clickedNode);
            graphNodes = graphNodes.filter(node => node !== clickedNode);
        } else {
            const clickedEdge = findEdgeByCoords(d3.pointer(event));
            if (clickedEdge) {
                edges = edges.filter(edge => edge !== clickedEdge);
            }
        }
        renderGraph();
    }
});

function updateNodeColor(nodeId, color) {
    board.selectAll("circle")
        .filter(d => d.id === nodeId)
        .transition()
        .duration(250)
        .attr("fill", color);
}

function findNodeByCoords(coords) {
    return graphNodes.find(node => {
        const dx = coords[0] - node.x;
        const dy = coords[1] - node.y;
        return Math.sqrt(dx * dx + dy * dy) <= 20;
    });
}

function findEdgeByCoords(coords) {
    return edges.find(edge => {
        const dx1 = coords[0] - edge.source.x;
        const dy1 = coords[1] - edge.source.y;
        const dx2 = coords[0] - edge.target.x;
        const dy2 = coords[1] - edge.target.y;
        return Math.sqrt(dx1 * dx1 + dy1 * dy1) <= 10 || Math.sqrt(dx2 * dx2 + dy2 * dy2) <= 10;
    });
}

function renderGraph() {
    board.selectAll("*").remove();

    const nodes = board.selectAll("circle")
        .data(graphNodes)
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 20)
        .attr("fill", "skyblue")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .call(d3.drag().on("start", function (event, d) {
            if (selectedAction) {
                event.on("drag", null);
            }
        }).on("drag", function (event, d) {
            if (!selectedAction) {
                d.x = event.x;
                d.y = event.y;
                d3.select(this).attr("cx", d.x).attr("cy", d.y);
                renderText();
                renderEdges();
            }
        }));

    renderText();
    renderEdges();
}

function renderText() {
    const nodeTexts = board.selectAll("text")
        .data(graphNodes)
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(d => d.id);
}

function renderEdges() {
    const r = 20;
    const edgesSelection = board.selectAll("line")
        .data(edges)
        .join("line")
        .attr("x1", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const offsetX = (dx / distance) * r;
            return d.source.x + offsetX;
        })
        .attr("y1", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const offsetY = (dy / distance) * r;
            return d.source.y + offsetY;
        })
        .attr("x2", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const offsetX = (dx / distance) * r;
            return d.target.x - offsetX;
        })
        .attr("y2", d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const offsetY = (dy / distance) * r;
            return d.target.y - offsetY;
        })
        .attr("stroke", "gray")
        .attr("z-index", -10)
        .attr("stroke-width", 3);


    const edgeTexts = board.selectAll("text.edgeWeight")
        .data(edges)
        .join("text")
        .attr("class", "edgeWeight")
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .text(d => d.weight);
}

async function runPrim() {
    if (graphNodes.length === 0 || edges.length === 0) {
        alert("Немає графів або ребер для виконання алгоритму!");
        return;
    }

    resetGraphStyles();

    let visitedNodes = new Set();
    let mstEdges = [];
    let startNode = graphNodes[Math.floor(Math.random() * graphNodes.length)];
    visitedNodes.add(startNode.id);

    function updateNodeColor(nodeId, color) {
        board.selectAll("circle")
            .filter(d => d.id === nodeId)
            .transition()
            .duration(500)
            .attr("fill", color);
    }

    function updateEdgeColor(edge, color) {
        board.selectAll("line")
            .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
                (d.source.id === edge.target.id && d.target.id === edge.source.id))
            .transition()
            .duration(250)
            .attr("stroke", color);
    }

    function findMinimumEdge() {
        let minEdge = null;
        let minWeight = Infinity;

        edges.forEach(edge => {
            if (visitedNodes.has(edge.source.id) && !visitedNodes.has(edge.target.id)) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
            else if (!visitedNodes.has(edge.source.id) && visitedNodes.has(edge.target.id)) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        });

        return minEdge;
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function primStep() {
        while (visitedNodes.size < graphNodes.length) {
            edges.forEach(edge => {
                if (visitedNodes.has(edge.source.id) && !visitedNodes.has(edge.target.id)) {
                    updateEdgeColor(edge, "#ffe954");
                    updateNodeColor(edge.target.id, "#ffe954");
                } else if (!visitedNodes.has(edge.source.id) && visitedNodes.has(edge.target.id)) {
                    updateEdgeColor(edge, "#ffe954");
                    updateNodeColor(edge.source.id, "#ffe954");
                }
            });

            await delay(1000);

            const minEdge = findMinimumEdge();
            if (minEdge) {
                mstEdges.push(minEdge);
                visitedNodes.add(minEdge.target.id);
                visitedNodes.add(minEdge.source.id);

                updateEdgeColor(minEdge, "green");
                updateNodeColor(minEdge.source.id, "green");
                updateNodeColor(minEdge.target.id, "green");
            }
            else break;

            await delay(1000);
        }
    }

    updateNodeColor(startNode.id, "green");
    await delay(1000);

    await primStep();

    edges = edges.filter(edge => mstEdges.includes(edge));
    renderGraph();
    edges.forEach(e => {
        result += e.weight;
    });
    document.getElementById("result").textContent = "Мінімальна довжина остового дерева: " + result;
}

function resetGraphStyles() {
    board.selectAll("circle")
        .transition()
        .duration(500)
        .attr("fill", "skyblue");

    board.selectAll("line")
        .transition()
        .duration(500)
        .attr("stroke", "gray");
}

function clearBoard() {
    graphNodes = [];
    edges = [];
    lastIndex = 1;
    document.getElementById("result").textContent = null;
    renderGraph();
}