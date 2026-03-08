import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }
        setSubmitting(true);
        // Simulate form submission
        await new Promise((res) => setTimeout(res, 1500));
        setSubmitting(false);
        setSubmitted(true);
        toast.success('Message sent! We\'ll get back to you shortly.', {
            duration: 5000,
            icon: '✉️',
            style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Our Location',
            details: ['123 Gourmet Street', 'Food City, FC 12345', 'United States'],
        },
        {
            icon: Phone,
            title: 'Phone Number',
            details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
        },
        {
            icon: Mail,
            title: 'Email Address',
            details: ['hello@saveurrestaurant.com', 'reservations@saveurrestaurant.com'],
        },
        {
            icon: Clock,
            title: 'Opening Hours',
            details: ['Mon–Fri: 11AM – 11PM', 'Sat: 10AM – 12AM', 'Sun: 10AM – 10PM'],
        },
    ];

    return (
        <div className="min-h-screen pt-20">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <p className="text-[#c8963e] text-sm uppercase tracking-widest mb-3 font-medium">Get in Touch</p>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-serif">
                        Contact <span className="gold-text">Us</span>
                    </h1>
                    <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
                        We'd love to hear from you. Make a reservation, ask a question, or just say hello!
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {contactInfo.map(({ icon: Icon, title, details }) => (
                            <div key={title} className="glass-card p-6 flex gap-4 hover:border-[rgba(200,150,62,0.3)] transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-[rgba(200,150,62,0.1)] border border-[rgba(200,150,62,0.2)] flex items-center justify-center flex-shrink-0">
                                    <Icon size={20} className="text-[#c8963e]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold mb-2">{title}</h3>
                                    {details.map((d) => (
                                        <p key={d} className="text-[#9ca3af] text-sm">{d}</p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Map Embed */}
                        <div className="glass-card overflow-hidden rounded-2xl">
                            <iframe
                                title="Restaurant Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209256345!2d-73.9858550845939!3d40.748440479328846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b30eac9f%3A0xaca05ca48ab8d1e4!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1583697698849!5m2!1sen!2sus"
                                width="100%"
                                height="220"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                allowFullScreen=""
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold text-white mb-2 font-serif">Send us a Message</h2>
                            <p className="text-[#9ca3af] text-sm mb-8">Fill out the form below and we'll respond within 24 hours.</p>

                            {submitted ? (
                                <div className="text-center py-16">
                                    <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                                    <p className="text-[#9ca3af]">Thank you for reaching out. We'll be in touch soon.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[#9ca3af] text-sm mb-2">
                                                Full Name <span className="text-[#c8963e]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                required
                                                className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#9ca3af] text-sm mb-2">
                                                Email Address <span className="text-[#c8963e]">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                required
                                                className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[#9ca3af] text-sm mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#9ca3af] text-sm mb-2">Subject</label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="">Select subject</option>
                                                <option value="reservation">Table Reservation</option>
                                                <option value="catering">Catering Inquiry</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[#9ca3af] text-sm mb-2">
                                            Message <span className="text-[#c8963e]">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us how we can help you..."
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#c8963e]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
