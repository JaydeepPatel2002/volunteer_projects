const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			service: 'gmail',
			port: Number(587),
			secure: Boolean(true),
			auth: {
				user: 'jaydeeppatelflirtyjk@gmail.com',
				pass: 'uwjadwaojyyjijuj',
			},
			tls:{
				rejectUnauthorized: false,
			}
		});

		await transporter.sendMail({
			from: 'jaydeeppatelflirtyjk@gmail.com',
			to: email,
			subject: subject,
			text: text,
		});
		console.log("email sent successfully");
	} catch (error) {
		console.log("email not sent!");
		console.log(error);
		return error;
	}
};
