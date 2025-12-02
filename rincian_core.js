// ============================
// URL Google Apps Script
// ============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztYcO3wuBGIkfcxKxApAFN572q6n-UuRAO15UN5ZbWmsBPbQdhPuhDYolE7yDq1By9qw/exec";

// Elemen tabel
const tbody = document.querySelector("#tabelData tbody");
const sumBrutoCell = document.getElementById("sumBrutoCell");
const sumPPhCell = document.getElementById("sumPPhCell");
const sumJknCell = document.getElementById("sumJknCell");
const sumJmlCell = document.getElementById("sumJmlCell");

// ============================
// TAMPILKAN INFORMASI LOADING
// ============================
function showLoading() {
    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align:center; padding:15px; color:#555;">
                ⏳ Sedang memuat data...
            </td>
        </tr>
    `;

    // Reset total
    sumBrutoCell.textContent = "0";
    sumPPhCell.textContent = "0";
    sumJknCell.textContent = "0";
    sumJmlCell.textContent = "0";
}

// ============================
// LOAD DATA DARI APPS SCRIPT
// ============================
async function loadData() {

    // tampilkan loading
    showLoading();

    const jenis = document.getElementById("jenisFilter").value;
    const triwulan = document.getElementById("triwulanFilter").value;
    const tahun = document.getElementById("tahunFilter").value;

    const url = `${SCRIPT_URL}?action=getRincian&jenis=${jenis}&triwulan=${triwulan}&tahun=${tahun}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengambil data!");

        const data = await response.json();
        renderTable(data);

    } catch (err) {
        tbody.innerHTML = `
            <tr><td colspan="9" style="text-align:center; color:red;">
                ❌ Terjadi kesalahan saat memuat data!
            </td></tr>
        `;
        console.error(err);
    }
}

// ============================
// RENDER TABEL
// ============================
function renderTable(data) {

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="9" style="text-align:center;">Tidak ada data ditemukan.</td></tr>
        `;
        return;
    }

    let html = "";
    let sumBruto = 0, sumPPh = 0, sumJkn = 0, sumJml = 0;

    data.forEach((row, i) => {

        const tanggal = row["Tanggal SP2D"]
            ? new Date(row["Tanggal SP2D"]).toLocaleDateString("id-ID")
            : "";

        html += `
            <tr>
                <td>${row.Jenis || ""}</td>
                <td>${row.triwulan || ""}</td>
                <td>${row["Nomor SP2D"] || ""}</td>
                <td>${tanggal}</td>
                <td>${formatNumber(row.Bruto)}</td>
                <td>${formatNumber(row.PPh)}</td>
                <td>${formatNumber(row.Jkn)}</td>
                <td>${row.Jml || "-"}</td>
                <td><button class="btn btn-detail" onclick="openDetail('${row.Jenis}','${row.Triwulan}','${row["Nomor SP2D"]}')">Detail</button></td>
            </tr>
        `;

        sumBruto += row.Bruto || 0;
        sumPPh += row.PPh || 0;
        sumJkn += row.Jkn || 0;
        sumJml += row.Jml || 0;
    });

    tbody.innerHTML = html;

    sumBrutoCell.textContent = formatNumber(sumBruto);
    sumPPhCell.textContent = formatNumber(sumPPh);
    sumJknCell.textContent = formatNumber(sumJkn);
    sumJmlCell.textContent = sumJml;
}

// ============================
// FORMAT ANGKA
// ============================
function formatNumber(num) {
    if (!num) return "0";
    return num.toLocaleString("id-ID");
}

// ============================
// BUKA DETAIL
// ============================
function openDetail(jenis, triwulan, sp2d) {
    sessionStorage.setItem("d_jenis", jenis);
    sessionStorage.setItem("d_triwulan", triwulan);
    sessionStorage.setItem("d_sp2d", sp2d);
    location.href = "detail.html";
}

// ============================
// LOAD AWAL SAAT HALAMAN DIBUKA
// ============================
window.onload = () => {
    showLoading();   // tampilkan loading dulu
    setTimeout(loadData, 300);  // beri delay sedikit agar loading terlihat
};

// ============================
// EVENT: FILTER OTOMATIS LOAD
// ============================
document.getElementById("tahunFilter").addEventListener("change", () => {
    showLoading();
    loadData();
});

document.getElementById("jenisFilter").addEventListener("change", () => {
    showLoading();
    loadData();
});

document.getElementById("triwulanFilter").addEventListener("change", () => {
    showLoading();
    loadData();
});
