const fs = require('fs');
const { jsPDF } = require('jspdf');
jsPDF.API.save = function(fileName) {
  fs.writeFileSync('tmp/pdfs/verified-font-fix.pdf', Buffer.from(this.output('arraybuffer')));
  return this;
};
const { generateFarmerPDF } = require('./generate-pdf.js');
(async () => {
  await generateFarmerPDF({
    farmerName: 'matthew',
    district: 'Vellore',
    districtTamilName: 'Tamil district omitted for PDF font safety',
    crop: 'Maize',
    cropTamilName: 'Tamil crop omitted for PDF font safety',
    landAcres: 6,
    isTenant: true,
    eligibility: 'high',
    loans: [
      { name: 'Kisan Credit Card', provider: 'Commercial, cooperative and regional rural banks', maxAmount: 300000, interestRate: '4%', documents: ['Aadhaar', 'Bank passbook', 'Land record or lease proof', 'Crop sowing certificate'] },
      { name: 'NABARD Short Term Crop Loan', provider: 'NABARD refinance through banks', maxAmount: 500000, interestRate: '7%', documents: ['Land record', 'Photo'] },
    ],
    insurance: [
      { name: 'PMFBY Crop Insurance', coverage: 'Protection against notified crop loss from weather and local calamities', premiumRate: '1.5-5%' },
      { name: 'Tamil Nadu Crop Relief', coverage: 'Relief support for officially notified crop damage', premiumRate: 'No farmer premium' },
    ],
    riskScore: 40,
    riskLevel: 'Medium Risk',
    advice: 'Moderate risk. Ensure crop insurance is active before sowing.',
    cropMsp: 2250,
    estimatedRevenue: 135000,
    projectedLoss: 24300,
  });
})();
