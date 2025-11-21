import nodemailer from 'nodemailer';

// ==============================
// KONFIGURASI TRANSPORTER
// ==============================
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==============================
// FUNGSI KIRIM EMAIL REGISTER
// ==============================
interface RegisterEmailProps {
  nama: string;
  email: string;
  password: string;
  role: string;
}

export const sendRegisterEmail = async ({
  nama,
  email,
  password,
  role,
}: RegisterEmailProps) => {
  const subject = 'Akun SIMADU Anda Telah Dibuat';

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6">
      <h2>Halo, ${nama}</h2>
      <p>Akun Anda telah berhasil dibuat di sistem <strong>SIMADU PKM CIKALAPA</strong>.</p>
      <p>Berikut detail akun Anda:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
        <li><strong>Role:</strong> ${role}</li>
      </ul>
      <p>Silakan login melalui tautan berikut:</p>
      <p><a href="https://simaducikalapa.vercel.app" style="color: #10b981; font-weight: bold">Login ke Sistem</a></p>
      <br/>
      <p>Terima kasih,</p>
      <p><strong>SIMADU UPTD Puskesmas Cikalapa</strong></p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Admin SIMADU Puskesmas Cikalapa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error('[MAIL REGISTER ERROR]', error);
    throw new Error('Gagal mengirim email notifikasi registrasi');
  }
};
