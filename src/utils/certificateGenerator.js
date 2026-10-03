import PDFDocument from "pdfkit";

const generateCertificatePDF = ({
    volunteerName,
    eventTitle,
    hours
}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50
            });

            const chunks = [];

            doc.on("data", (chunk) => {
                chunks.push(chunk);
            });

            doc.on("end", () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });

            doc.on("error", (error) => {
                reject(error);
            });

            // Certificate title
            doc
                .fontSize(30)
                .font("Helvetica-Bold")
                .text(
                    "CERTIFICATE OF VOLUNTEER SERVICE",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(2);

            // Introductory text
            doc
                .fontSize(16)
                .font("Helvetica")
                .text(
                    "This certificate is proudly presented to",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1);

            // Volunteer name
            doc
                .fontSize(26)
                .font("Helvetica-Bold")
                .text(
                    volunteerName,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1.5);

            // Event information
            doc
                .fontSize(16)
                .font("Helvetica")
                .text(
                    "for successfully volunteering in",
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            doc
                .fontSize(22)
                .font("Helvetica-Bold")
                .text(
                    eventTitle,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(1.5);

            // Volunteer hours
            doc
                .fontSize(18)
                .font("Helvetica")
                .text(
                    `Volunteer Hours: ${hours}`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(3);

            // Footer
            doc
                .fontSize(12)
                .font("Helvetica")
                .text(
                    `Issued by HelpHub`,
                    {
                        align: "center"
                    }
                );

            doc.moveDown(0.5);

            doc
                .fontSize(10)
                .text(
                    `Generated on: ${new Date().toLocaleDateString()}`,
                    {
                        align: "center"
                    }
                );

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

export default generateCertificatePDF;