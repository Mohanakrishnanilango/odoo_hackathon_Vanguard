'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    coverPhoto: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          budget: formData.budget ? parseFloat(formData.budget) : 0,
          coverPhoto: formData.coverPhoto || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create trip')
        return
      }

      router.push(`/trips/${data.trip.id}/itinerary`)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear

  const month1Days = generateCalendarDays(currentYear, currentMonth)
  const month2Days = generateCalendarDays(nextMonthYear, nextMonth)

  const isInRange = (day: number, month: number, year: number) => {
    if (!formData.startDate || !formData.endDate) return false
    const date = new Date(year, month, day)
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    return date >= start && date <= end
  }

  const isStartDate = (day: number, month: number, year: number) => {
    if (!formData.startDate) return false
    const date = new Date(year, month, day)
    const start = new Date(formData.startDate)
    return date.getTime() === start.getTime()
  }

  const isEndDate = (day: number, month: number, year: number) => {
    if (!formData.endDate) return false
    const date = new Date(year, month, day)
    const end = new Date(formData.endDate)
    return date.getTime() === end.getTime()
  }

  const handleDateClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day).toISOString().split('T')[0]
    
    if (!formData.startDate || (formData.startDate && formData.endDate)) {
      setFormData({ ...formData, startDate: date, endDate: '' })
    } else if (formData.startDate && !formData.endDate) {
      const start = new Date(formData.startDate)
      const selected = new Date(year, month, day)
      if (selected < start) {
        setFormData({ ...formData, startDate: date, endDate: '' })
      } else {
        setFormData({ ...formData, endDate: date })
      }
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <Layout>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
        >
          {/* Header Section */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-slate-700">
            <h1 className="text-3xl font-black text-text-main dark:text-white mb-2 tracking-tight">
              Let's plan your next adventure
            </h1>
            <p className="text-text-secondary dark:text-slate-400 text-base">
              Give your trip a name and set the dates to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Trip Name Input */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-text-main dark:text-gray-200" htmlFor="trip-name">
                Trip Name
              </label>
              <div className="relative">
                <input
                  className="w-full h-14 pl-4 pr-4 rounded-xl border border-border-light dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-lg text-text-main dark:text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  id="trip-name"
                  type="text"
                  placeholder="e.g., Summer in Santorini"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-text-main dark:text-gray-200">Duration</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                  </div>
                  <input
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light dark:border-slate-600 bg-white dark:bg-slate-800 text-text-main dark:text-white placeholder-text-secondary focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    type="date"
                    placeholder="Start Date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400">event</span>
                  </div>
                  <input
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border-light dark:border-slate-600 bg-white dark:bg-slate-800 text-text-main dark:text-white placeholder-text-secondary focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    type="date"
                    placeholder="End Date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Calendar Picker (Visual Only) */}
              <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hidden md:block">
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                  {/* Month 1 */}
                  <div className="flex-1 max-w-[320px]">
                    <div className="flex items-center justify-between mb-4">
                      <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <span className="font-bold text-text-main dark:text-white">
                        {monthNames[currentMonth]} {currentYear}
                      </span>
                      <div className="w-8"></div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-bold mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                      {month1Days.map((day, index) => {
                        if (day === null) return <span key={index}></span>
                        const inRange = isInRange(day, currentMonth, currentYear)
                        const isStart = isStartDate(day, currentMonth, currentYear)
                        const isEnd = isEndDate(day, currentMonth, currentYear)
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateClick(day, currentMonth, currentYear)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                              isStart || isEnd
                                ? 'bg-primary text-white shadow-md'
                                : inRange
                                ? 'bg-primary/10 text-text-main dark:text-white'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-600"></div>

                  {/* Month 2 */}
                  <div className="flex-1 max-w-[320px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8"></div>
                      <span className="font-bold text-text-main dark:text-white">
                        {monthNames[nextMonth]} {nextMonthYear}
                      </span>
                      <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-bold mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                      {month2Days.map((day, index) => {
                        if (day === null) return <span key={index}></span>
                        const inRange = isInRange(day, nextMonth, nextMonthYear)
                        const isStart = isStartDate(day, nextMonth, nextMonthYear)
                        const isEnd = isEndDate(day, nextMonth, nextMonthYear)
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateClick(day, nextMonth, nextMonthYear)}
                            className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                              isStart || isEnd
                                ? 'bg-primary text-white shadow-md'
                                : inRange
                                ? 'bg-primary/10 text-text-main dark:text-white'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-text-main dark:text-gray-200" htmlFor="description">
                Trip Description <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                className="w-full p-4 rounded-xl border border-border-light dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-text-main dark:text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                id="description"
                placeholder="What are you hoping to do? (e.g., Relaxing by the beach, hiking the trails...)"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
              />
              <div className="flex justify-end">
                <span className="text-xs text-gray-400">{formData.description.length}/500 characters</span>
              </div>
            </div>

            {/* Cover Photo Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-text-main dark:text-gray-200">Cover Photo</label>
              <div className="border-2 border-dashed border-border-light dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-2xl">add_photo_alternate</span>
                  </div>
                  <p className="text-sm font-medium text-text-main dark:text-white mb-1">
                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-text-secondary dark:text-slate-400">SVG, PNG, JPG or GIF (max. 3MB)</p>
                  <input
                    type="url"
                    className="mt-4 w-full max-w-md px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-text-main dark:text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Or paste image URL here"
                    value={formData.coverPhoto}
                    onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-text-secondary dark:text-slate-300 hover:text-text-main dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Creating...' : 'Create Trip'}</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </Layout>
  )
}
