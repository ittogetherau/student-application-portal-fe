const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function findSigPage() {
  const pdfPath = path.join(__dirname, '../../../../public/docs/advanced_standing_form.pdf');
  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  
  const fields = form.getFields();
  const pages = pdfDoc.getPages();

  console.log(`Total Pages: ${pages.length}`);

  fields.forEach(field => {
    const name = field.getName();
    if (name.toLowerCase().includes('date') || name.toLowerCase().includes('sign')) {
      try {
        const widgets = field.acroField.getWidgets();
        widgets.forEach((w, i) => {
          const rect = w.getRectangle();
          
          let pageNum = -1;
          for (let p=0; p<pages.length; p++) {
             const annots = pages[p].node.Annots();
             if (annots) {
               for (let a=0; a<annots.size(); a++) {
                 if (annots.lookup(a) === w.dict) {
                   pageNum = p;
                 }
               }
             }
          }

          console.log(`Field "${name}" widget ${i}: Page=${pageNum+1}, x=${rect.x}, y=${rect.y}`);
        });
      } catch(e) {
      }
    }
  });
}

findSigPage();
