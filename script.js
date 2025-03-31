let bord = [];
let historik = [];

function genererBordplan() {
    const navneInput = document.getElementById('navneInput').value;
    const navne = navneInput.split(/[\s,]+/).filter(n => n.trim() !== '');
    
    if (navne.length === 0) {
        alert("Indtast venligst nogle navne!");
        return;
    }

    const eleverPerBord = parseInt(document.getElementById('eleverPerBord').value);
    const ugenslaeg = document.getElementById('ugenslaeg').value.split(',').map(n => n.trim());

    // Tilfældig rækkefølge uden ugenslæg
    let tilfaeldeNavne = navne.sort(() => 0.5 - Math.random());
    
    // Ugenslæg kontrol
    for (let i = 0; i < tilfaeldeNavne.length; i++) {
        for (const par of ugenslaeg) {
            if (tilfaeldeNavne[i] === par[0] && tilfaeldeNavne[i+1] === par[1]) {
                [tilfaeldeNavne[i], tilfaeldeNavne[i+1]] = [tilfaeldeNavne[i+1], tilfaeldeNavne[i]];
            }
        }
    }

    // Opmount i par
    const nyttBord = [];
    for (let i = 0; i < tilfaeldeNavne.length; i += eleverPerBord) {
        nyttBord.push(tilfaeldeNavne.slice(i, i + eleverPerBord));
    }

    // Gem i historik
    historik.push(nyttBord);
    localStorage.setItem('historik', JSON.stringify(historik));

    // Opdater visning
    opdaterBordplan(nyttBord);
}

function opdaterBordplan(nyttBord) {
    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = '';

    nyttBord.forEach((par, index) => {
        const tableCard = document.createElement('div');
        tableCard.className = 'table-card';
        tableCard.draggable = true;
        tableCard.dataset.index = index;

        // Bordnummer
        const tableNumber = document.createElement('div');
        tableNumber.className = 'table-number';
        tableNumber.textContent = `Bord ${index + 1}`;
        tableCard.appendChild(tableNumber);

        // Drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.textContent = '☰';
        tableCard.appendChild(dragHandle);

        // Opret navn-elementer
        par.forEach(navn => {
            const nameElement = document.createElement('div');
            nameElement.className = 'table-name';
            nameElement.textContent = navn;
            nameElement.draggable = true;

            // Elev drag & drop
            nameElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text', navn);
                e.dataTransfer.effectAllowed = 'move';
            });

            nameElement.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetName = e.dataTransfer.getData('text');
                const targetElement = e.target;
                
                if (targetElement.textContent !== navn) {
                    targetElement.textContent = navn;
                    nameElement.textContent = targetName;
                }
            });

            nameElement.addEventListener('dragover', (e) => e.preventDefault());

            tableCard.appendChild(nameElement);
        });

        // Bord drag & drop
        tableCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('tableIndex', e.target.dataset.index);
        });

        tableContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const sourceIndex = parseInt(e.dataTransfer.getData('tableIndex'));
            const targetIndex = Array.from(tableContainer.children).indexOf(e.target);
            
            if (sourceIndex !== targetIndex && sourceIndex < bord.length && targetIndex < bord.length) {
                [bord[sourceIndex], bord[targetIndex]] = [bord[targetIndex], bord[sourceIndex]];
                opdaterBordplan(bord);
            }
        });

        tableContainer.appendChild(tableCard);
    });

    bord = nyttBord;
}

// Anden funktioner...

function downloadImage() {
    html2canvas(document.querySelector(".table-container")).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'bordplan.png';
        link.click();
    });
}

function eksportPDF() {
    const docDefinition = {
        content: [
            { text: 'Bordplan', style: 'header' },
            ...bord.map((par, index) => ({
                text: `Bord ${index + 1}: ${par.join(', ')}`,
                margin: [0, 10, 0, 10]
            }))
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 20, 0, 20] }
        }
    };
    pdfMake.createPdf(docDefinition).download('bordplan.pdf');
}

function filterNavne() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('.table-name').forEach(name => {
        name.style.display = name.textContent.toLowerCase().includes(search) ? 'block' : 'none';
    });
}

function showStatistik() {
    // Implementer statistikvisning
}

function showHistorik() {
    // Implementer historikvisning
}

function genfraHistorik() {
    // Genskab fra historik
}

function resetBordplan() {
    document.getElementById('navneInput').value = '';
    document.querySelector('.table-container').innerHTML = '';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Lad siden load
document.addEventListener('DOMContentLoaded', () => {
    const savedHistorik = localStorage.getItem('historik');
    if (savedHistorik) historik = JSON.parse(savedHistorik);
});