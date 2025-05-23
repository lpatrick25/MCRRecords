import { ScanbotSDK } from "capacitor-plugin-scanbot-sdk";

async function createDocumentPDF() {
    try {
        /** Load a document from storage or create a new one */
        const document = await ScanbotSDK.Document.loadDocument({
            documentID: 'SOME_STORED_DOCUMENT_ID'
        });
        /** Create a PDF file with the provided options */
        const pdfUriResult = await ScanbotSDK.Document.createPDF({
            documentID: document.uuid,
            options: {
                pageSize: 'A4',
                pageDirection: 'PORTRAIT',
                ocrConfiguration: {
                    engineMode: 'SCANBOT_OCR',
                },
            },
        });
        /** Handle the result */
    } catch (e: any) {
        console.error(e.message);
    }
}
