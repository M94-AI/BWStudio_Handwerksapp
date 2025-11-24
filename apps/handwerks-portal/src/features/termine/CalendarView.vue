<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import UiButton from '@/components/ui/Button.vue'

// FullCalendar
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core'

// Beispiel-Termine (später per API laden)
const events = ref<EventInput[]>([
  {
    id: '1',
    title: 'Heizungswartung Müller',
    start: new Date().toISOString().slice(0, 10), // heute
  },
])
// später z.B. 'dayGridMonth,timeGridWeek,timeGridDay' , evtl oben in der Toolbar oder so als option
// Grade für disponenten evtl ganz cool
// Kalender-Optionen
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  selectable: true,
  editable: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: '',
  },
  events: events.value,
  select: handleDateSelect,
  eventClick: handleEventClick,
}))

// Neuen Termin durch Klick in den Kalender anlegen
function handleDateSelect(arg: DateSelectArg) {
  const title = prompt('Titel für Termin eingeben:', 'Neuer Auftrag')
  if (!title) return

  const newEvent: EventInput = {
    id: String(Date.now()),
    title,
    start: arg.startStr,
    end: arg.endStr,
    allDay: arg.allDay,
  }

  events.value = [...events.value, newEvent]
}

// Termin per Klick bearbeiten / löschen
function handleEventClick(arg: EventClickArg) {
  const action = prompt(
    `Termin: "${arg.event.title}"\n\n` +
    'Was möchtest du tun?\n' +
    '1 = Titel ändern\n' +
    '2 = Löschen\n' +
    'Abbrechen = Nichts machen',
    '1'
  )

  if (action === '1') {
    const newTitle = prompt('Neuer Titel:', arg.event.title)
    if (newTitle) {
      arg.event.setProp('title', newTitle)
      // auch im local state nachziehen
      events.value = events.value.map(e =>
        e.id === arg.event.id ? { ...e, title: newTitle } : e
      )
    }
  } else if (action === '2') {
    if (confirm('Diesen Termin wirklich löschen?')) {
      arg.event.remove()
      events.value = events.value.filter(e => e.id !== arg.event.id)
    }
  }
}

function resetEvents() {
  events.value = []
}
</script>

<template>
  <div>
    <h1>Termine</h1>

    <div class="toolbar">
      <UiButton variant="ghost" type="button" @click="resetEvents">
        Alle Termine löschen (lokal, nur zum testen gerade)
      </UiButton>
    </div>

    <Card>
      <FullCalendar :options="calendarOptions" />
    </Card>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: .75rem;
}

/* FullCalendar Basis-Styles ein bisschen einrahmen */
:deep(.fc) {
  font-size: .9rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.1rem;
}
</style>
