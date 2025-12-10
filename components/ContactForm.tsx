import React, { useState } from 'react';
import { useNotifier } from '../hooks/useNotifier';
import { contactService } from '../services/contactService';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotifier();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      notify({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notify({ message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(formData.phone) || phoneDigits.length < 10) {
      notify({ message: 'Please enter a valid phone number', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save submission to database
      await contactService.add({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      });
      
  notify({ message: 'Message sent successfully! We\'ll get back to you soon.', type: 'success' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      notify({ message: 'Failed to send message. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-unistay-navy sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">Have a question or feedback? We'd love to hear from you!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl shadow-md p-8 space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-unistay-navy mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-unistay-yellow focus:bg-yellow-50 transition-colors"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-unistay-navy mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-unistay-yellow focus:bg-yellow-50 transition-colors"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-unistay-navy mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 (0) 800 123 4567"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-unistay-yellow focus:bg-yellow-50 transition-colors"
              required
            />
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-unistay-navy mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-unistay-yellow focus:bg-yellow-50 transition-colors"
              required
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-unistay-navy mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us more about your inquiry..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-unistay-yellow focus:bg-yellow-50 transition-colors resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                  : 'bg-unistay-navy text-white hover:bg-unistay-yellow hover:text-unistay-navy'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-paper-plane"></i>
                  Send Message
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
