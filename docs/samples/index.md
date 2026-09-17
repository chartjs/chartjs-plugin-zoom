---
title: Samples
aside: false
next: false
prev: false
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

// vuepress-plugin-redirect used to send /samples to the first sample; this page
// stands in for it so links and bookmarks to the bare directory keep working.
const router = useRouter()
onMounted(() => router.go(withBase('/samples/basic')))
</script>

# Samples

Redirecting to [Basic](./basic)…
