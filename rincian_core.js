const API_URL = "https://script.google.com/macros/s/AKfycbztYcO3wuBGIkfcxKxApAFN572q6n-UuRAO15UN5ZbWmsBPbQdhPuhDYolE7yDq1By9qw/exec";

/* ===============================
   PARSER TANGGAL KHUSUS INDONESIA
   =============================== */

function parseTanggal(tgl) {
    if (!tgl) return null;

    // Jika format ISO → langsung return
    if (tgl.includes("T") || tgl.includes("-")) {
        return new Date(tgl);
    }

    // Jika format: "25 Maret 2025"
    const bulanIndo = {
        Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
        Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11
    };

    const bagian = tgl.split(" ");
    if (bagian.length === 3) {
        const tanggal = parseInt(bagian[0]);
        const bulan = bulanIndo[bagian[1]];
        const tahun = parseInt(bagian[2]);
        if (bulan !== undefined) return new Date(tahun, bulan, tanggal);
    }

    return null;
}

function formatTanggalIndo(tgl) {
    const date = parseTanggal(tgl);
    if (!date) return tgl;

    const bulan = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

/* ===============================
             LOAD DATA
   =============================== */

async function loadData(){
    const jenis = jenisFilter.value;
    const tri = triwulanFilter.value;
    const tahun = tahunFilter.value;

    const tbody = document.querySelector("#tabelData tbody");
    tbody.innerHTML = `<tr><td colspan="8">Memuat data...</td></tr>`;

    const res = await fetch(API_URL + "?mode=sheet1");
    let data = await res.json();

    /* ===============================
       FILTER TAHUN
       =============================== */
    data = data.filter(r => {
        const d = parseTanggal(r["Tanggal SP2D"]);
        return d && d.getFullYear() == tahun;
    });

    /* ===============================
       FILTER JENIS
       =============================== */
    if (jenis !== "ALL") {
        data = data.filter(r => r.Jenis == jenis);
    }

    /* ===============================
       FILTER TRIWULAN
       =============================== */
    if (tri !== "ALL") {
        data = data.filter(r => {
            const d = parseTanggal(r["Tanggal SP2D"]);
            const bulan = d.getMonth() + 1;
            return Math.ceil(bulan / 3) == tri;
        });
    }

    tbody.innerHTML = "";

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">Tidak ada data untuk filter ini</td></tr>`;
        return;
    }

    /* ===============================
       MENAMPILKAN DATA
       =============================== */

    let totalBruto = 0, totalPPh = 0, totalJkn = 0, totalJml = 0;

    data.forEach(r => {
        const bruto = Number(r.Bruto || 0);
        const pph = Number(r.PPh || 0);
        const jkn = Number(r.Jkn || 0);
        const jml = Number(r.Jml || 0);

        totalBruto += bruto;
        totalPPh += pph;
        totalJkn += jkn;
        totalJml += jml;

        tbody.innerHTML += `
        <tr>
            <td>${r.Jenis}</td>
            <td>${r["Nomor SP2D"]}</td>
            <td>${formatTanggalIndo(r["Tanggal SP2D"])}</td>
            <td>${bruto.toLocaleString("id-ID")}</td>
            <td>${pph.toLocaleString("id-ID")}</td>
            <td>${jkn.toLocaleString("id-ID")}</td>
            <td>${jml.toLocaleString("id-ID")}</td>
            <td><a href="${r["Link Drive Penerima"]}" target="_blank">Detail</a></td>
        </tr>`;
    });

    /* ===============================
       TAMPILKAN TOTAL
       =============================== */

    document.getElementById("sumBrutoCell").innerHTML = totalBruto.toLocaleString("id-ID");
    document.getElementById("sumPPhCell").innerHTML = totalPPh.toLocaleString("id-ID");
    document.getElementById("sumJknCell").innerHTML = totalJkn.toLocaleString("id-ID");
    document.getElementById("sumJmlCell").innerHTML = totalJml.toLocaleString("id-ID");
}

window.onload = loadData;
