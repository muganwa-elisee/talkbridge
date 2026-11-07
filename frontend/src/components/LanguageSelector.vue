<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Language' },
  modelValue: { type: String, required: true },
  exclude: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const languages = [
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🏴' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'rn', name: 'Kirundi', flag: '🇧🇮' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'om', name: 'Oromo', flag: '🇪🇹' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
  { code: 'sn', name: 'Shona', flag: '🇿🇼' },
  { code: 'st', name: 'Sesotho', flag: '🇱🇸' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'wo', name: 'Wolof', flag: '🇸🇳' },
  { code: 'xh', name: 'Xhosa', flag: '🇿🇦' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
]

const inputId = useId()
const search = ref('')
const open = ref(false)
const selectedLanguage = computed(() => languages.find((language) => language.code === props.modelValue))
const filteredLanguages = computed(() => languages.filter((language) => (
  language.code !== props.exclude
  && language.name.toLowerCase().includes(search.value.trim().toLowerCase())
)))

function openOptions() {
  open.value = true
  search.value = ''
}

function closeOptions() {
  open.value = false
  search.value = ''
}

function selectLanguage(language) {
  emit('update:modelValue', language.code)
  closeOptions()
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeOptions()
  } else if (event.key === 'Enter' && open.value && filteredLanguages.value.length) {
    event.preventDefault()
    selectLanguage(filteredLanguages.value[0])
  }
}

function handleFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) closeOptions()
}
</script>

<template>
  <div class="language-selector" @focusout="handleFocusOut">
    <label class="form-label" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      class="field language-search"
      type="search"
      role="combobox"
      autocomplete="off"
      :value="open ? search : selectedLanguage?.name || ''"
      :placeholder="open ? 'Search languages…' : 'Select a language'"
      :aria-label="label"
      :aria-expanded="open"
      :aria-controls="`${inputId}-options`"
      aria-autocomplete="list"
      @focus="openOptions"
      @input="search = $event.target.value; open = true"
      @keydown="handleKeydown"
    />
    <ul v-if="open" :id="`${inputId}-options`" class="language-options" role="listbox" :aria-label="`${label} options`">
      <li v-for="language in filteredLanguages" :key="language.code" role="presentation">
        <button
          class="language-option"
          :class="{ selected: language.code === modelValue }"
          type="button"
          role="option"
          :aria-selected="language.code === modelValue"
          @click="selectLanguage(language)"
        >
          <span aria-hidden="true">{{ language.flag }}</span>
          <span>{{ language.name }}</span>
        </button>
      </li>
      <li v-if="!filteredLanguages.length" class="language-empty" role="presentation">No languages found.</li>
    </ul>
  </div>
</template>
