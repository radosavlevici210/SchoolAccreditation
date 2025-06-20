import PDFDocument from 'pdfkit';
import { type Certificate } from '@shared/schema';

export class CertificateGenerator {
  generateCertificatePDF(certificate: Certificate): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add watermark - Legal Copyright Protection
        doc.save();
        doc.rotate(45, { origin: [300, 400] });
        doc.fontSize(40)
           .fillColor('#E5E7EB')
           .text('© 2025 Ervin Remus Radosavlevici - Nuralai School', 0, 350, {
             align: 'center',
             width: 600
           });
        doc.fontSize(20)
           .fillColor('#F3F4F6')
           .text('UKPRN: 10008000 - INTERNATIONALLY ACCREDITED', 0, 400, {
             align: 'center',
             width: 600
           });
        doc.restore();

        // Header with logo placeholder
        doc.fillColor('#1E40AF')
           .circle(300, 100, 30)
           .fill();

        // School name and title
        doc.fontSize(24)
           .fillColor('#1E293B')
           .text('Nuralai School', 0, 150, { align: 'center' });

        doc.fontSize(18)
           .fillColor('#64748B')
           .text('Certificate of Completion', 0, 180, { align: 'center' });

        // Certificate content
        doc.fontSize(14)
           .fillColor('#64748B')
           .text('This is to certify that', 0, 250, { align: 'center' });

        doc.fontSize(20)
           .fillColor('#1E293B')
           .text(certificate.studentName, 0, 280, { align: 'center' });

        doc.fontSize(14)
           .fillColor('#64748B')
           .text('has successfully completed the course', 0, 310, { align: 'center' });

        doc.fontSize(16)
           .fillColor('#1E40AF')
           .text(certificate.courseTitle, 0, 340, { align: 'center' });

        // Footer information
        doc.fontSize(12)
           .fillColor('#64748B')
           .text(`Date of Completion: ${certificate.completionDate}`, 50, 450);

        doc.text(`Certificate ID: ${certificate.certificateId}`, 350, 450);

        if (certificate.grade) {
          doc.text(`Grade: ${certificate.grade}`, 50, 470);
        }

        doc.text('UKPRN: 10008000 - OFFICIAL', 350, 470);
        doc.text('INTERNATIONALLY ACCREDITED', 350, 485);

        // Digital signature placeholder
        doc.rect(400, 500, 120, 50)
           .fillAndStroke('#1E40AF', '#1E40AF');

        doc.fontSize(8)
           .fillColor('white')
           .text('OFFICIAL SEAL', 420, 520);

        doc.fontSize(8)
           .fillColor('#64748B')
           .text('Digital Signature', 420, 560);

        // Legal Protection Notice
        doc.fontSize(6)
           .fillColor('#64748B')
           .text('LEGALLY PROTECTED DOCUMENT - UNAUTHORIZED REPRODUCTION PROHIBITED', 0, 680, { align: 'center' });
           
        doc.fontSize(8)
           .fillColor('#64748B')
           .text('UKPRN REGISTERED INSTITUTION - INTERNATIONALLY ACCREDITED', 0, 695, { align: 'center' });

        // Copyright footer
        doc.fontSize(8)
           .fillColor('#64748B')
           .text('© 2025 Ervin Remus Radosavlevici - Nuralai School', 0, 710, { align: 'center' });

        doc.text('ervin210@icloud.com | ervin.radosavlevici@mail.com | All rights reserved.', 0, 725, { align: 'center' });
        
        doc.fontSize(6)
           .fillColor('#64748B')
           .text('CPD Certified | ASIC Accredited | EduQual Aligned | GDPR Compliant | ISO/IEC 27001', 0, 740, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const certificateGenerator = new CertificateGenerator();
