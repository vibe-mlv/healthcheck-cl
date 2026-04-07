'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { EnvelopeSimple, MapPin } from '@phosphor-icons/react'
import Link from 'next/link'

interface ContactFormData {
  name: string
  phone: string
  email: string
  message: string
}

const ContactUsSection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitMessage('')

    const formspreeUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL

    if (!formspreeUrl) {
      setSubmitMessage('Configuration error. Please contact support.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitMessage("Thank you for your message! We'll get back to you soon.")
        reset()
      } else {
        setSubmitMessage('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="pageShell">
      {/* Section Header */}
      <div className="sectionHeader" style={{ marginBottom: '48px' }}>
        <h3>Get in Touch</h3>
        <p style={{ color: 'var(--ml-gray-base)', marginTop: '12px', maxWidth: '70ch', lineHeight: 1.6 }}>
          Ready to boost your local presence? Let&apos;s discuss how we can help your business grow.
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="sectionCard">
          <h2 style={{ fontSize: '1.4rem', color: 'var(--ml-navy-dark)', marginBottom: '24px', fontFamily: 'var(--font-crimson), serif', fontWeight: 600 }}>
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '20px' }}>
            {/* Name Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--ml-navy-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
                Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                placeholder="Your full name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.name ? 'var(--ml-error)' : 'rgba(30, 59, 122, 0.12)'}`,
                  borderRadius: '14px',
                  background: errors.name ? 'rgba(220, 38, 38, 0.08)' : 'var(--ml-gray-light)',
                  fontSize: '0.95rem',
                  color: 'var(--ml-gray-dark)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 160ms ease',
                } as React.CSSProperties}
              />
              {errors.name && <p style={{ marginTop: '6px', color: 'var(--ml-error)', fontSize: '0.85rem' }}>{errors.name.message}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--ml-navy-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
                Phone
              </label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                type="tel"
                placeholder="Your phone number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.phone ? 'var(--ml-error)' : 'rgba(30, 59, 122, 0.12)'}`,
                  borderRadius: '14px',
                  background: errors.phone ? 'rgba(220, 38, 38, 0.08)' : 'var(--ml-gray-light)',
                  fontSize: '0.95rem',
                  color: 'var(--ml-gray-dark)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 160ms ease',
                } as React.CSSProperties}
              />
              {errors.phone && <p style={{ marginTop: '6px', color: 'var(--ml-error)', fontSize: '0.85rem' }}>{errors.phone.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--ml-navy-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
                Email *
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.email ? 'var(--ml-error)' : 'rgba(30, 59, 122, 0.12)'}`,
                  borderRadius: '14px',
                  background: errors.email ? 'rgba(220, 38, 38, 0.08)' : 'var(--ml-gray-light)',
                  fontSize: '0.95rem',
                  color: 'var(--ml-gray-dark)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 160ms ease',
                } as React.CSSProperties}
              />
              {errors.email && <p style={{ marginTop: '6px', color: 'var(--ml-error)', fontSize: '0.85rem' }}>{errors.email.message}</p>}
            </div>

            {/* Message Field */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--ml-navy-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
                Message *
              </label>
              <textarea
                {...register('message', {
                  required: 'Message is required',
                  minLength: {
                    value: 10,
                    message: 'Message must be at least 10 characters long',
                  },
                  maxLength: {
                    value: 1000,
                    message: 'Message must not exceed 1000 characters',
                  },
                })}
                placeholder="Tell us about your business and how we can help..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.message ? 'var(--ml-error)' : 'rgba(30, 59, 122, 0.12)'}`,
                  borderRadius: '14px',
                  background: errors.message ? 'rgba(220, 38, 38, 0.08)' : 'var(--ml-gray-light)',
                  fontSize: '0.95rem',
                  color: 'var(--ml-gray-dark)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 160ms ease',
                  resize: 'none',
                } as React.CSSProperties}
              />
              {errors.message && <p style={{ marginTop: '6px', color: 'var(--ml-error)', fontSize: '0.85rem' }}>{errors.message.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="primaryButton"
              style={{
                width: '100%',
                marginTop: '8px',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {/* Submit Message */}
            {submitMessage && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  background: submitMessage.includes('Thank you') ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  color: submitMessage.includes('Thank you') ? 'var(--ml-success)' : 'var(--ml-error)',
                  border: `1px solid ${submitMessage.includes('Thank you') ? 'var(--ml-success)' : 'var(--ml-error)'}`,
                } as React.CSSProperties}
              >
                {submitMessage}
              </div>
            )}
          </form>
        </div>

        {/* Contact Information */}
        <div className="sectionCard">
          <h2 style={{ fontSize: '1.4rem', color: 'var(--ml-navy-dark)', marginBottom: '24px', fontFamily: 'var(--font-crimson), serif', fontWeight: 600 }}>
            Let&apos;s Connect
          </h2>

          {/* Contact Info Items */}
          <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
            {/* Email */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  background: 'rgba(80, 120, 184, 0.14)',
                } as React.CSSProperties}
              >
                <EnvelopeSimple size={20} color="var(--ml-navy-base)" weight="fill" />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--ml-navy-dark)', marginBottom: '4px', fontSize: '0.95rem' }}>
                  Email Us
                </strong>
                <p style={{ color: 'var(--ml-gray-base)', fontSize: '0.9rem' }}>inquiry@maplovin.com</p>
                <small style={{ color: 'var(--ml-gray-base)', display: 'block', marginTop: '4px', fontSize: '0.85rem' }}>
                  We&apos;ll respond within 24 hours
                </small>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  background: 'rgba(80, 120, 184, 0.14)',
                } as React.CSSProperties}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ml-navy-base)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--ml-navy-dark)', marginBottom: '4px', fontSize: '0.95rem' }}>
                  Call Us
                </strong>
                <p style={{ color: 'var(--ml-gray-base)', fontSize: '0.9rem' }}>+84 33 606 1307</p>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  borderRadius: '12px',
                  background: 'rgba(80, 120, 184, 0.14)',
                } as React.CSSProperties}
              >
                <MapPin size={20} color="var(--ml-navy-base)" weight="fill" />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--ml-navy-dark)', marginBottom: '4px', fontSize: '0.95rem' }}>
                  Address
                </strong>
                <p style={{ color: 'var(--ml-gray-base)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  82 Pho Duc Chinh Ward 1, Binh Thanh District Ho Chi Minh City, Vietnam
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(30, 59, 122, 0.1)', paddingTop: '24px' }}>
            <strong style={{ display: 'block', color: 'var(--ml-navy-dark)', marginBottom: '16px', fontSize: '0.95rem' }}>
              Follow Us
            </strong>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                href="https://www.facebook.com/maplovin"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(80, 120, 184, 0.14)',
                  color: 'var(--ml-navy-base)',
                  transition: 'background-color 160ms ease',
                } as React.CSSProperties}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link
                href="https://www.linkedin.com/company/maplovin"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(80, 120, 184, 0.14)',
                  color: 'var(--ml-navy-base)',
                  transition: 'background-color 160ms ease',
                } as React.CSSProperties}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.811 0-9.728h3.554v1.375c.428-.659 1.191-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.363v5.585zM5.337 8.855c-1.144 0-1.915-.762-1.915-1.715 0-.956.77-1.715 1.946-1.715 1.177 0 1.915.759 1.915 1.715 0 .953-.738 1.715-1.946 1.715zm1.595 11.597H3.762V9.579h3.17v10.873zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactUsSection
