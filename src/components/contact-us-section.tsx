'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Facebook } from 'lucide-react'
import '../styles/contact-section.css'

interface ContactFormData {
  name: string
  phone: string
  email: string
  message: string
}

const ContactUsSection: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>()

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

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
    <>
      <section className='relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden'>
        {/* Floating Contact Bubbles */}
        <div className='contact-bubble'></div>
        <div className='contact-bubble'></div>
        <div className='contact-bubble'></div>
        <div className='contact-bubble'></div>
        <div className='contact-bubble'></div>
        <div className='contact-bubble'></div>

        <div className='container mx-auto px-6 relative z-10'>
          <div className='max-w-4xl mx-auto'>
            {/* Header */}
            <div
              className={`text-center mb-16 transition-all duration-1000 transform ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className='text-4xl md:text-5xl font-bold mb-6'>
                <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent contact-pulse-text'>
                  Get in Touch
                </span>
              </h2>
              <p
                className={`text-lg text-gray-600 transition-all duration-1000 delay-300 transform ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                Ready to boost your local presence? Let&apos;s discuss how we can help your business
                grow.
              </p>
            </div>

            <div className='grid lg:grid-cols-2 gap-12 items-start'>
              {/* Contact Form */}
              <div
                className={`transition-all duration-1000 delay-500 transform ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className='bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-6 contact-bounce-gentle'>
                    Send us a Message
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        type='text'
                        id='name'
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='Your full name'
                      />
                      {errors.name && (
                        <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label
                        htmlFor='phone'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Phone
                      </label>
                      <input
                        {...register('phone', { required: 'Phone number is required' })}
                        type='tel'
                        id='phone'
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='Your phone number'
                      />
                      {errors.phone && (
                        <p className='mt-1 text-sm text-red-600'>{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
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
                        type='email'
                        id='email'
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='your.email@example.com'
                      />
                      {errors.email && (
                        <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor='message'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
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
                        id='message'
                        rows={5}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                          errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder='Tell us about your business and how we can help...'
                      />
                      {errors.message && (
                        <p className='mt-1 text-sm text-red-600'>{errors.message.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
                    >
                      <span
                        className={`${isSubmitting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      >
                        Send Message
                      </span>
                      {isSubmitting && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        </div>
                      )}
                      <div className='contact-shimmer absolute inset-0'></div>
                    </button>

                    {/* Submit Message */}
                    {submitMessage && (
                      <div
                        className={`p-4 rounded-lg text-center ${
                          submitMessage.includes('Thank you')
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {submitMessage}
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Contact Information */}
              <div
                className={`transition-all duration-1000 delay-700 transform ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
              >
                <div className='bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20'>
                  <h3 className='text-2xl font-bold text-gray-800 mb-6 contact-bounce-gentle'>
                    Let&apos;s Connect
                  </h3>

                  <div className='space-y-6'>
                    <div className='flex items-start space-x-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center contact-float'>
                        <Mail className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800'>Email Us</h4>
                        <p className='text-gray-600'>inquiry@maplovin.com</p>
                        <p className='text-sm text-gray-500 mt-1'>
                          We&apos;ll respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center contact-bounce-gentle'>
                        <Phone className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800'>Call Us</h4>
                        <p className='text-gray-600'>+84 33 606 1307</p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center contact-float'>
                        <MapPin className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-800'>Address</h4>
                        <p className='text-gray-600'>
                          82 Pho Duc Chinh Ward 1, Binh Thanh District Ho Chi Minh City, Vietnam
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='mt-8 pt-6 border-t border-gray-200'>
                    <h4 className='font-semibold text-gray-800 mb-4'>Follow Us</h4>
                    <div className='flex space-x-4'>
                      <Link
                        href='https://www.facebook.com/maplovin'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='Facebook'
                        className='w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transform hover:scale-110 transition-all duration-300'
                      >
                        <Facebook className='w-5 h-5' />
                      </Link>
                      <Link
                        href='https://www.linkedin.com/company/maplovin'
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label='LinkedIn'
                        className='w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-white hover:bg-blue-900 transform hover:scale-110 transition-all duration-300'
                      >
                        <Linkedin className='w-5 h-5' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactUsSection
