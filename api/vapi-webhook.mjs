import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body
  const { type, call } = body

  console.log('VAPI webhook received:', type, call?.id)

  try {
    switch(type) {

      case 'call-started': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, business_name')
          .eq('vapi_phone_number_id', call.phoneNumberId)
          .single()

        if (!profile) {
          console.log('No user found for phone number:', call.phoneNumberId)
          return res.status(200).json({ received: true })
        }

        await supabase.from('call_logs').insert({
          user_id: profile.id,
          vapi_call_id: call.id,
          vapi_phone_number_id: call.phoneNumberId,
          caller_number: call.customer?.number || 'Unknown',
          status: 'ongoing',
          type: 'inbound',
          started_at: new Date().toISOString()
        })
        break
      }

      case 'call-ended': {
        await supabase.from('call_logs')
          .update({
            status: 'completed',
            duration: call.duration || 0,
            recording_url: call.recordingUrl || null,
            transcript: call.transcript || null,
            ended_at: new Date().toISOString(),
            ended_reason: call.endedReason || null
          })
          .eq('vapi_call_id', call.id)
        break
      }

      case 'end-of-call-report': {
        const transcript = body.transcript || ''
        const summary = body.summary || ''
        const structuredData = body.analysis?.structuredData || {}

        let meetingBooked = structuredData.appointmentBooked || false
        let appointmentDate = structuredData.appointmentDate || null
        let appointmentTime = structuredData.appointmentTime || null
        let callerName = structuredData.callerName || null

        if (!meetingBooked) {
          const text = (transcript + ' ' + summary).toLowerCase()
          const keywords = [
            'appointment booked', 'meeting scheduled',
            'confirmed for', 'see you on', 'booked for',
            'haan aaunga', 'kal milte hain', 'book kar diya',
            'slot confirm', 'i will come'
          ]
          meetingBooked = keywords.some(k => text.includes(k))
        }

        await supabase.from('call_logs')
          .update({
            summary: summary,
            transcript: transcript,
            meeting_booked: meetingBooked,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            caller_name: callerName
          })
          .eq('vapi_call_id', call.id)

        if (meetingBooked) {
          const { data: callLog } = await supabase
            .from('call_logs')
            .select('user_id, caller_number')
            .eq('vapi_call_id', call.id)
            .single()

          if (callLog) {
            await supabase.from('appointments').insert({
              user_id: callLog.user_id,
              caller_name: callerName || 'Unknown',
              caller_number: callLog.caller_number,
              appointment_date: appointmentDate,
              appointment_time: appointmentTime,
              source: 'voice_agent',
              status: 'confirmed'
            })
          }
        }
        break
      }

      default:
        console.log('Unhandled webhook type:', type)
    }

    return res.status(200).json({ received: true })

  } catch (err) {
    console.error('Webhook error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}