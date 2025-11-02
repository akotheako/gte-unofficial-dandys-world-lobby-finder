const functions = require("firebase-functions")
const nodemailer = require("nodemailer")
const admin = require("firebase-admin")
if (!admin.apps.length) admin.initializeApp()

exports.sendFeedbackEmail = functions.https.onCall(async (data, _ctx) => {
	const category = String(data?.category || "other").slice(0, 32)
	const message = String(data?.message || "").trim()
	const contact = String(data?.contact || "").trim()
	if (!message) return { ok: false, error: "Empty message" }

	const cfg = functions.config()
	const transporter = nodemailer.createTransport({
		host: cfg.smtp.host,
		port: Number(cfg.smtp.port || 587),
		secure: String(cfg.smtp.port) === "465",
		auth: { user: cfg.smtp.user, pass: cfg.smtp.pass },
	})

	const subject = `[${category}] GTE feedback`
	const text = [
		`Category: ${category}`,
		contact ? `Contact: ${contact}` : `Contact: (not provided)`,
		``,
		message
	].join("\n")

	await transporter.sendMail({
		from: cfg.smtp.from,   // e.g. "GTE <no-reply@yourdomain>"
		to: cfg.feedback.to,   // your inbox
		subject,
		text,
		replyTo: contact || cfg.smtp.from,
	})

	return { ok: true }
})
