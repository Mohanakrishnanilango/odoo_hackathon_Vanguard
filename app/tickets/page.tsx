'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import FlightTicket from '@/components/FlightTicket'
import { EXCHANGE_RATE } from '@/lib/currency'

interface FlightBooking {
  id: string
  bookingReference: string
  flight: {
    airline: string
    flightNumber: string
    departure: {
      airport: string
      city: string
      time: string
      date: string
      terminal: string
    }
    arrival: {
      airport: string
      city: string
      time: string
      date: string
      terminal: string
    }
    duration: string
    stops: number
  }
  passengers: Array<{
    name: string
    type: 'adult' | 'child' | 'infant'
  }>
  classType: 'economy' | 'business' | 'first'
  totalPrice: number
  status: 'upcoming' | 'completed' | 'cancelled' | 'check-in'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  bookingDate: string
  additionalServices: {
    travelInsurance: boolean
    extraBaggage: boolean
    seatSelection: boolean
  }
  paymentMethod: string
}

export default function TicketViewPage() {
  const [bookings, setBookings] = useState<FlightBooking[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<FlightBooking | null>(null)
  const [currency] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate] = useState(EXCHANGE_RATE)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Mock bookings data - in real app, this would fetch from API
      const mockBookings: FlightBooking[] = [
        {
          id: 'BK001',
          bookingReference: 'FLABC123',
          flight: {
            airline: 'SpiceJet',
            flightNumber: 'SG524',
            departure: {
              airport: 'CJB',
              city: 'Coimbatore',
              time: '09:30',
              date: '2024-01-14',
              terminal: '1'
            },
            arrival: {
              airport: 'MAA',
              city: 'Chennai',
              time: '10:15',
              date: '2024-01-14',
              terminal: '1'
            },
            duration: '45m',
            stops: 0
          },
          passengers: [
            { name: 'Raja Rajan M', type: 'adult' }
          ],
          classType: 'economy',
          totalPrice: 2500,
          status: 'upcoming',
          paymentStatus: 'paid',
          bookingDate: '2024-01-01T10:00:00Z',
          additionalServices: {
            travelInsurance: true,
            extraBaggage: false,
            seatSelection: true
          },
          paymentMethod: 'card'
        },
        {
          id: 'BK002',
          bookingReference: 'FLXYZ789',
          flight: {
            airline: 'IndiGo',
            flightNumber: '6E7123',
            departure: {
              airport: 'CJB',
              city: 'Coimbatore',
              time: '14:45',
              date: '2024-01-14',
              terminal: '2'
            },
            arrival: {
              airport: 'MAA',
              city: 'Chennai',
              time: '15:30',
              date: '2024-01-14',
              terminal: '1'
            },
            duration: '45m',
            stops: 0
          },
          passengers: [
            { name: 'Raja Rajan M', type: 'adult' },
            { name: 'Guest User', type: 'adult' }
          ],
          classType: 'business',
          totalPrice: 8000,
          status: 'upcoming',
          paymentStatus: 'paid',
          bookingDate: '2024-01-05T14:30:00Z',
          additionalServices: {
            travelInsurance: true,
            extraBaggage: true,
            seatSelection: true
          },
          paymentMethod: 'upi'
        }
      ]
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintTicket = () => {
    window.print()
  }

  const handleDownloadTicket = (booking: FlightBooking) => {
    // Create a simple text version of the ticket
    const ticketText = `
FLIGHT TICKET
================
Booking Reference: ${booking.bookingReference}
Airline: ${booking.flight.airline}
Flight Number: ${booking.flight.flightNumber}

Departure:
${booking.flight.departure.city} (${booking.flight.departure.airport})
Date: ${new Date(booking.flight.departure.date).toLocaleDateString()}
Time: ${booking.flight.departure.time}
Terminal: ${booking.flight.departure.terminal}

Arrival:
${booking.flight.arrival.city} (${booking.flight.arrival.airport})
Date: ${new Date(booking.flight.arrival.date).toLocaleDateString()}
Time: ${booking.flight.arrival.time}
Terminal: ${booking.flight.arrival.terminal}

Duration: ${booking.flight.duration}
Class: ${booking.classType.toUpperCase()}
Total Price: ₹${booking.totalPrice * exchangeRate}

Passengers:
${booking.passengers.map(p => `- ${p.name} (${p.type})`).join('\n')}

Status: ${booking.status.toUpperCase()}
Payment: ${booking.paymentStatus.toUpperCase()}
Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}

Booking Reference: ${booking.bookingReference}
================
    `.trim()

    // Create download link
    const blob = new Blob([ticketText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flight-ticket-${booking.bookingReference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Flight Tickets
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View and manage your flight bookings
            </p>
          </div>

          {/* Booking List */}
          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
                flight_takeoff
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Flight Bookings Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You haven't booked any flights yet.
              </p>
              <button
                onClick={() => window.location.href = '/flights'}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Book a Flight
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    {/* Booking Actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {booking.flight.airline} {booking.flight.flightNumber}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {booking.flight.departure.city} → {booking.flight.arrival.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                        >
                          View Ticket
                        </button>
                        <button
                          onClick={handlePrintTicket}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => handleDownloadTicket(booking)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Ticket Preview */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <FlightTicket
                        booking={booking}
                        currency={currency}
                        exchangeRate={exchangeRate}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Flight Ticket
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              <div className="p-6">
                <FlightTicket
                  booking={selectedBooking}
                  currency={currency}
                  exchangeRate={exchangeRate}
                />
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 flex justify-between">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintTicket}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(selectedBooking)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </Layout>
  )
}
