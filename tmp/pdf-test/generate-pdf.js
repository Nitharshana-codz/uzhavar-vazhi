"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFarmerPDF = generateFarmerPDF;
const jspdf_1 = __importDefault(require("jspdf"));
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const GREEN = [22, 101, 52];
const LIGHT_GREEN = [240, 253, 244];
const AMBER = [217, 119, 6];
const RED = [220, 38, 38];
const MUTED = [107, 114, 128];
const PAGE_BOTTOM = 266;
function pdfSafeText(value) {
    return (value !== null && value !== void 0 ? value : "")
        .normalize("NFKD")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
function formatINR(value) {
    return typeof value === "number" && Number.isFinite(value)
        ? `Rs. ${value.toLocaleString("en-IN")}`
        : "Varies";
}
function profileFromArgs(profile, results) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    if ("loans" in profile && "insurance" in profile && "landAcres" in profile) {
        return profile;
    }
    const cropMsp = (_f = (_b = (_a = results === null || results === void 0 ? void 0 : results.msp) === null || _a === void 0 ? void 0 : _a.mspPerQuintal) !== null && _b !== void 0 ? _b : (_e = (_d = (_c = results === null || results === void 0 ? void 0 : results.msp) === null || _c === void 0 ? void 0 : _c.varieties) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.mspPerQuintal) !== null && _f !== void 0 ? _f : 0;
    const landAcres = (_h = (_g = profile.landAcres) !== null && _g !== void 0 ? _g : profile.landSize) !== null && _h !== void 0 ? _h : 0;
    const estimatedRevenue = (_l = (_k = (_j = results === null || results === void 0 ? void 0 : results.msp) === null || _j === void 0 ? void 0 : _j.revenueProjection) === null || _k === void 0 ? void 0 : _k.revenueAtMSP) !== null && _l !== void 0 ? _l : cropMsp * landAcres * 10;
    const projectedLoss = (_p = (_o = (_m = results === null || results === void 0 ? void 0 : results.msp) === null || _m === void 0 ? void 0 : _m.revenueProjection) === null || _o === void 0 ? void 0 : _o.lostToMiddlemen) !== null && _p !== void 0 ? _p : estimatedRevenue * 0.18;
    return {
        farmerName: profile.farmerName,
        district: profile.district,
        districtTamilName: (_r = (_q = profile.districtTamilName) !== null && _q !== void 0 ? _q : results === null || results === void 0 ? void 0 : results.districtTamilName) !== null && _r !== void 0 ? _r : "",
        crop: profile.crop,
        cropTamilName: (_s = profile.cropTamilName) !== null && _s !== void 0 ? _s : (_t = results === null || results === void 0 ? void 0 : results.msp) === null || _t === void 0 ? void 0 : _t.tamilName,
        landAcres,
        isTenant: (_u = profile.isTenant) !== null && _u !== void 0 ? _u : (profile.ownership === "tenant" || profile.ownership === "leasehold"),
        eligibility: results === null || results === void 0 ? void 0 : results.eligibilityLevel,
        loans: (_v = results === null || results === void 0 ? void 0 : results.loans) !== null && _v !== void 0 ? _v : [],
        insurance: (_w = results === null || results === void 0 ? void 0 : results.insurance) !== null && _w !== void 0 ? _w : [],
        riskScore: (_x = results === null || results === void 0 ? void 0 : results.riskScore) !== null && _x !== void 0 ? _x : 0,
        riskLevel: (_y = results === null || results === void 0 ? void 0 : results.riskLevel) !== null && _y !== void 0 ? _y : "Low",
        advice: (_z = results === null || results === void 0 ? void 0 : results.advice) !== null && _z !== void 0 ? _z : "",
        cropMsp,
        estimatedRevenue,
        projectedLoss,
    };
}
function ensureSpace(doc, y, requiredHeight) {
    if (y + requiredHeight <= PAGE_BOTTOM) {
        return y;
    }
    doc.addPage();
    return 18;
}
function sectionHeading(doc, title, margin, y, size = 13) {
    y = ensureSpace(doc, y, 14);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(title, margin, y);
    doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2.5, margin + 48, y + 2.5);
    return y + 8;
}
function drawFooter(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFillColor(243, 244, 246);
        doc.rect(0, 278, pageWidth, 19, "F");
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text("Generated securely via Uzhavar Vazhi Platform (Tamil Nadu Farmer Financial Readiness Hub).", pageWidth / 2, 285, { align: "center" });
        doc.text("This document is an analytical reference. Please verify exact terms with local cooperative or bank managers.", pageWidth / 2, 291, { align: "center" });
    }
}
async function generateFarmerPDF(farmerProfile, legacyResults) {
    var _a, _b, _c;
    const profile = profileFromArgs(farmerProfile, legacyResults);
    const doc = new jspdf_1.default("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 0;
    doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Uzhavar Vazhi", margin, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Farmer Financial Readiness Profile - Seasonal Evaluation", margin, 25);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 15, { align: "right" });
    y = 52;
    y = sectionHeading(doc, "FARMER SUMMARY", margin, y);
    (0, jspdf_autotable_1.default)(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: "grid",
        body: [
            ["Farmer Profile", pdfSafeText(profile.farmerName) || "Farmer"],
            ["District Location", pdfSafeText(profile.district)],
            ["Main Crop Target", pdfSafeText(profile.crop)],
            ["Cultivation Area", `${profile.landAcres} Acres`],
            ["Land Tenure Mode", profile.isTenant ? "Tenant Farmer" : "Land Owner (Direct Cultivation)"],
            ["Scheme Eligibility", profile.eligibility === "high" ? "Verified Eligible" : pdfSafeText(profile.eligibility) || "Verified Eligible"],
        ],
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 58 }, 1: { cellWidth: 122 } },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: [31, 41, 55] },
        didParseCell: (data) => {
            if (data.section === "body" && data.row.index === 5 && data.column.index === 1) {
                data.cell.styles.textColor = GREEN;
                data.cell.styles.fontStyle = "bold";
            }
        },
    });
    y = doc.lastAutoTable.finalY + 12;
    y = sectionHeading(doc, "SEASONAL RISK ASSESSMENT", margin, y);
    const riskColor = profile.riskScore <= 35 ? GREEN : profile.riskScore <= 60 ? AMBER : RED;
    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(margin, y, 62, 18, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${pdfSafeText(profile.riskLevel) || "Risk"} (${profile.riskScore}/100)`, margin + 5, y + 11);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const adviceLines = doc.splitTextToSize(pdfSafeText(profile.advice) || "Use insurance and formal credit for safer seasonal planning.", pageWidth - margin * 2 - 72);
    doc.text(adviceLines, margin + 70, y + 7);
    y += Math.max(26, adviceLines.length * 5 + 10);
    y = sectionHeading(doc, "ELIGIBLE LOAN SCHEMES", margin, y);
    if (profile.loans.length > 0) {
        (0, jspdf_autotable_1.default)(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Scheme Name", "Provider", "Max Sanction Amount", "Interest Rate"]],
            body: profile.loans.map((loan) => [
                pdfSafeText(loan.name),
                pdfSafeText(loan.provider),
                formatINR(loan.maxAmount),
                pdfSafeText(loan.interestRate),
            ]),
            headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: LIGHT_GREEN },
            styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3 },
        });
        y = doc.lastAutoTable.finalY + 10;
    }
    else {
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("No eligible loan schemes found for your profile", margin, y);
        y += 10;
    }
    const documents = [...new Set(profile.loans.flatMap((loan) => loan.documents))];
    if (documents.length > 0) {
        y = sectionHeading(doc, "REQUIRED LOAN APPLICATION DOCUMENTS CHECKLIST", margin, y, 11);
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        documents.forEach((document) => {
            y = ensureSpace(doc, y, 7);
            doc.text(`- ${pdfSafeText(document)}`, margin + 2, y);
            y += 6;
        });
        y += 5;
    }
    y = sectionHeading(doc, "ELIGIBLE INSURANCE SCHEMES", margin, y);
    if (profile.insurance.length > 0) {
        (0, jspdf_autotable_1.default)(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [["Scheme Name", "Coverage Scope", "Premium Rate"]],
            body: profile.insurance.map((insurance) => [
                pdfSafeText(insurance.name),
                pdfSafeText(insurance.coverage),
                pdfSafeText(insurance.premiumRate),
            ]),
            headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: LIGHT_GREEN },
            styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3 },
        });
        y = doc.lastAutoTable.finalY + 10;
    }
    else {
        doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("No eligible insurance schemes found", margin, y);
        y += 10;
    }
    const cropMsp = (_a = profile.cropMsp) !== null && _a !== void 0 ? _a : 0;
    if (cropMsp > 0) {
        const estimatedRevenue = (_b = profile.estimatedRevenue) !== null && _b !== void 0 ? _b : cropMsp * profile.landAcres * 10;
        const projectedLoss = (_c = profile.projectedLoss) !== null && _c !== void 0 ? _c : estimatedRevenue * 0.18;
        y = sectionHeading(doc, "MSP PRICE ANALYTICS (2026-27 SEASON)", margin, y);
        y = ensureSpace(doc, y, 42);
        doc.setTextColor(31, 41, 55);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${pdfSafeText(profile.crop)} MSP Protection Matrix`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Official Government Minimum Support Price: ${formatINR(cropMsp)} / quintal`, margin, y + 8);
        doc.text(`Your Estimated Yield Revenue potential at full MSP value: ${formatINR(estimatedRevenue)}`, margin, y + 16);
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(margin, y + 22, pageWidth - margin * 2, 16, 2, 2, "F");
        doc.setTextColor(146, 64, 14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.3);
        doc.text(doc.splitTextToSize(`Projected Loss to Middlemen if sold at local market rates: ${formatINR(projectedLoss)} (Claim official MSP channels to protect this value)`, pageWidth - margin * 2 - 8), margin + 4, y + 29);
        y += 48;
    }
    y = ensureSpace(doc, y, 34);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 27, 2, 2, "F");
    doc.setTextColor(120, 53, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Actionable Guidance Note:", margin + 4, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.text(doc.splitTextToSize("To claim official MSP valuation and reduce local intermediary fees, submit a printout of this Financial Readiness Profile to your nearest PACS center or regional Agriculture Officer.", pageWidth - margin * 2 - 8), margin + 4, y + 15);
    drawFooter(doc);
    const fileName = `uzhavar-vazhi-${profile.farmerName || profile.district}-${profile.crop}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    doc.save(`${fileName || "farmer-profile"}.pdf`);
}
