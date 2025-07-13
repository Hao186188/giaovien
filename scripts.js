
let students = [];
let history = [];
let spinning = false;
let useNames = false;
let namesFromExcel = [];

const studentCountInput = document.getElementById('studentCount');
const startBtn = document.getElementById('startBtn');
const drawBtn = document.getElementById('drawBtn');
const resultDiv = document.getElementById('result');
const historyDiv = document.getElementById('history');
const congratsDiv = document.getElementById('congrats');
const excelInput = document.getElementById('excelInput');
const startNameBtn = document.getElementById('startNameBtn');
const nameStatus = document.getElementById('nameStatus');


excelInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        // Lấy sheet đầu tiên
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Chuyển sheet thành mảng các dòng
        const rows = XLSX.utils.sheet_to_json(sheet, {header:1});
        // Bỏ qua dòng đầu tiên (tiêu đề), lấy từ dòng thứ hai trở đi
        let names = [];
        for (let i = 1; i < rows.length; i++) {
            let cell = rows[i][0];
            if (cell && typeof cell === 'string') {
                // Chuyển mã hóa về đúng UTF-8 nếu bị lỗi
                try {
                    let decoded = decodeURIComponent(escape(cell.trim()));
                    names.push(decoded);
                } catch (e) {
                    names.push(cell.trim());
                }
            }
        }
        if (names.length > 0) {
            namesFromExcel = names;
            nameStatus.textContent = `Đã đọc ${names.length} tên học sinh từ file.`;
        } else {
            nameStatus.textContent = 'Không tìm thấy tên học sinh trong file.';
        }
    };
    reader.readAsArrayBuffer(file);
});

startBtn.onclick = function() {
    useNames = false;
    const count = parseInt(studentCountInput.value);
    if (isNaN(count) || count < 1) {
        alert('Vui lòng nhập số lượng học sinh hợp lệ!');
        return;
    }
    students = Array.from({length: count}, (_, i) => i + 1);
    history = [];
    drawBtn.disabled = false;
    resultDiv.textContent = '';
    congratsDiv.style.display = 'none';
    updateHistory();
};

startNameBtn.onclick = function() {
    if (namesFromExcel.length === 0) {
        alert('Vui lòng chọn file Excel có danh sách tên học sinh!');
        return;
    }
    useNames = true;
    students = [...namesFromExcel];
    history = [];
    drawBtn.disabled = false;
    resultDiv.textContent = '';
    congratsDiv.style.display = 'none';
    updateHistory();
};

drawBtn.onclick = function() {
    if (spinning || students.length === 0) return;
    spinning = true;
    drawBtn.disabled = true;
    congratsDiv.style.display = 'none';
    let spinTimes = 30 + Math.floor(Math.random() * 20); // số lần quay
    let i = 0;
    let spinInterval = setInterval(() => {
        let fakeVal = students[Math.floor(Math.random() * students.length)];
        resultDiv.textContent = useNames ? `Tên được gọi: ${fakeVal}` : `Số được gọi: ${fakeVal}`;
        resultDiv.style.color = '#2980b9';
        i++;
        if (i >= spinTimes) {
            clearInterval(spinInterval);
            // Chọn thật sự
            const idx = Math.floor(Math.random() * students.length);
            const val = students.splice(idx, 1)[0];
            history.push(val);
            resultDiv.textContent = useNames ? `Tên được gọi: ${val}` : `Số được gọi: ${val}`;
            resultDiv.style.color = '#e74c3c';
            updateHistory();
            showCongrats(val);
            spinning = false;
            if (students.length === 0) {
                drawBtn.disabled = true;
            } else {
                drawBtn.disabled = false;
            }
        }
    }, 60);
};

function showCongrats(val) {
    congratsDiv.style.display = 'none';
    const popupCongrats = document.getElementById('popup-congrats');
    popupCongrats.innerHTML = `<div class='popup-content'><span class="confetti">🎉</span> <b>Chúc mừng ${useNames ? val : 'số ' + val}!</b> <span class="confetti">🎉</span><br><button id='closePopupBtn'>Đóng</button></div>`;
    popupCongrats.style.display = 'flex';
    showFallingHearts();
    document.getElementById('closePopupBtn').onclick = function() {
        popupCongrats.style.display = 'none';
        clearFallingHearts();
    };
}

function showFallingHearts() {
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';
    heartsContainer.style.position = 'fixed';
    heartsContainer.style.left = '0';
    heartsContainer.style.top = '0';
    heartsContainer.style.width = '100vw';
    heartsContainer.style.height = '100vh';
    heartsContainer.style.pointerEvents = 'none';
    for (let i = 0; i < 18; i++) {
        let heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDelay = (Math.random() * 1.2) + 's';
        heartsContainer.appendChild(heart);
    }
}

function clearFallingHearts() {
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';
}

function updateHistory() {
    if (history.length === 0) {
        historyDiv.textContent = '';
    } else {
        historyDiv.innerHTML = useNames ? ('<b>Đã gọi:</b> ' + history.join(', ')) : ('<b>Đã gọi:</b> ' + history.join(', '));
    }
}
