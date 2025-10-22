<template>
  <div class="shell" :class="{ 'collapsed': isCollapsed }">
    <!-- Topbar (sollte nur Mobile sichtbar sein) -->
    <header class="topbar">
      <button
        class="burger"
        :aria-expanded="mobileOpen ? 'true' : 'false'"
        aria-controls="sidebar"
        aria-label="Menü umschalten"
        @click="toggleMobile"
      >
        <span></span><span></span><span></span>
      </button>
      <h1 class="brand">Handwerker-Portal</h1>
    </header>

    <!-- Sidebar -->
<aside
  id="sidebar"
  class="sidebar"
  :class="{ open: mobileOpen }"
  @keydown.esc="mobileOpen=false"
  tabindex="-1"
>
  <div class="side-head">
    <span class="logo">🔧</span>
    <strong class="title" v-show="!isCollapsed">Handwerker-Portal</strong>
    <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? 'Ausklappen' : 'Einklappen'">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 5l8 7-8 7V5z"/>
      </svg>
    </button>
  </div>

  <nav class="nav" @click="closeOnNavIfMobile">
    <RouterLink class="nav-link" to="/dashboard" :data-title="tooltip('Dashboard')">
      <LayoutDashboard class="i" />
      <span class="t">Dashboard</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/auftraege" :data-title="tooltip('Aufträge')">
      <Wrench class="i" />
      <span class="t">Aufträge</span>
      <span class="badge" v-if="ordersBadge && !isCollapsed">{{ ordersBadge }}</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/rechnungen" :data-title="tooltip('Rechnungen')">
      <FileText class="i" />
      <span class="t">Rechnungen</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/lager" :data-title="tooltip('Lager')">
      <Package class="i" />
      <span class="t">Lager</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/termine" :data-title="tooltip('Termine')">
      <Calendar class="i" />
      <span class="t">Termine</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/kunden" :data-title="tooltip('Kunden')">
      <Users class="i" />
      <span class="t">Kunden</span>
    </RouterLink>

    <RouterLink class="nav-link" to="/angebote" :data-title="tooltip('Angebote')">
  <FilePlus class="i" />
  <span class="t">Angebote</span>
</RouterLink>

  </nav>

  <div class="side-foot" :class="{ 'center': isCollapsed }">
    <button class="logout" @click="logout" :title="isCollapsed ? 'Logout' : ''">
      <LogOut class="i" />
      <span class="t" v-show="!isCollapsed">Logout</span>
    </button>
    <small class="ver" v-show="!isCollapsed">v0.1.0</small>
  </div>
</aside>

    <!-- Inhalt -->
    <main class="content" @click="closeOnContentIfMobile">
      <RouterView />
    </main>

    <!-- Overlay (Mobile) -->
    <div class="overlay" v-show="mobileOpen" @click="mobileOpen=false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useAuthStore } from '@/features/auth/auth.store'
import { LayoutDashboard, Wrench, FileText, Package, Calendar, Users, LogOut, FilePlus } from 'lucide-vue-next'
const mobileOpen = ref(false)
const isCollapsed = ref(false)
// Demo-Badge (z. B. offene Aufträge). Später aus Store/Service füllen.
const ordersBadge = ref<number | null>(3)

onMounted(() => {
  if (window.matchMedia('(max-width: 900px)').matches) mobileOpen.value = false
})

function toggleMobile(){ mobileOpen.value = !mobileOpen.value }
function toggleCollapse(){ isCollapsed.value = !isCollapsed.value }
function closeOnNavIfMobile(){ if (window.matchMedia('(max-width: 900px)').matches) mobileOpen.value = false }
function closeOnContentIfMobile(){ if (window.matchMedia('(max-width: 900px)').matches) mobileOpen.value = false }
function tooltip(text: string){ return isCollapsed.value ? text : '' }

function logout(){
  // const auth = useAuthStore(); auth.logout()
  localStorage.removeItem('auth')
  window.location.href = '/login'
}
</script>

<style scoped>
/* Layout */
.shell{
  display:grid; grid-template-columns: 280px 1fr;
  min-height:100vh; position:relative; background:var(--c-bg, #f7f7f9);
}
.topbar{display:none; align-items:center; gap:.6rem; padding:.5rem .75rem; border-bottom:1px solid var(--c-border,#e6e8ec); background:#fff;}
.brand{font-size:1.05rem; margin:0;}
.burger{display:inline-flex; flex-direction:column; gap:4px; width:40px;height:40px; border:1px solid var(--c-border,#e6e8ec); border-radius:.5rem; background:#fff}
.burger span{display:block; width:20px; height:2px; background:#333}

/* Sidebar */
.sidebar{
  position:sticky; top:0; height:100vh; display:flex; flex-direction:column;
  border-right:1px solid var(--c-sidebar-border);
  background:var(--c-sidebar-bg);
  color:var(--c-sidebar-text);
  z-index:20;
  transition:background .2s,color .2s;
}
.side-head{
  display:flex;
  align-items:center;
  justify-content:space-between;   /* verteilt Logo/Title/Button */
  padding:.75rem;                  /* symmetrisch */
  height:56px;                     /* feste Höhe = saubere Vertikalmitte */
  box-sizing:border-box;
}

.logo{font-size:1.1rem}
.title{white-space:nowrap; color:var(--c-sidebar-text)}
.collapse-btn{
  display:flex; align-items:center; justify-content:center;
  width:32px; height:32px;
  border:1px solid var(--c-sidebar-border);
  border-radius:.5rem;
  background:transparent;
  color:var(--c-sidebar-icon);
  flex-shrink:0;                   /* verhindert Quetschen */
}

.shell.collapsed .collapse-btn{
  margin-right:.25rem;             /* minimal nach innen, wenn Sidebar 72px */
}

/* Navigation in der Sidebar */
.nav{
  display:flex; flex-direction:column; gap:.15rem;
  padding:.25rem; overflow-y:auto; min-height:0;
}
.nav-link{
  display:flex; align-items:center; gap:.6rem; padding:.45rem .6rem;
  text-decoration:none; color:var(--c-sidebar-text);
  border-radius:.5rem; position:relative; transition:background .15s,color .15s;
}
.nav-link:hover{ background:var(--c-sidebar-active-bg); color:var(--c-sidebar-active-text) }
.nav-link.router-link-active{
  background:var(--c-sidebar-active-bg);
  color:var(--c-sidebar-active-text); font-weight:600;
}
.nav-link .i{ width:1.25rem; text-align:center; color:var(--c-sidebar-icon) }
.nav-link .badge{
  margin-left:auto; background:var(--c-sidebar-active-bg); color:var(--c-sidebar-active-text);
  border-radius:999px; padding:.1rem .45rem; font-size:.78rem
}

/* Footer in Sidebar */
.side-foot{ margin-top:auto; padding:.75rem; display:flex; flex-direction:column; gap:.4rem }
.side-foot.center{ align-items:center }
.logout{
  display:flex; align-items:center; gap:.6rem; width:100%;
  border:1px solid var(--c-sidebar-border); background:transparent;
  border-radius:.5rem; padding:.45rem .6rem; cursor:pointer; color:var(--c-sidebar-text);
}
.logout:hover{ background:var(--c-sidebar-active-bg); color:var(--c-sidebar-active-text) }
.ver{ color:#cbd5e1 }

.shell.collapsed{ grid-template-columns: 72px 1fr; }
.shell.collapsed .sidebar{ width:72px }
.shell.collapsed .title, .shell.collapsed .nav-link .t, .shell.collapsed .ver { display:none }
.shell.collapsed .collapse-btn{ transform:rotate(180deg) }

/* Tooltip im Collapsed */
.shell.collapsed .nav-link[data-title]:hover::after{
  content: attr(data-title);
  position: absolute; left: 72px; top:50%; transform:translateY(-50%);
  background:#111; color:#fff; padding:.25rem .5rem; border-radius:.4rem;
  white-space:nowrap; box-shadow:0 2px 10px rgba(0,0,0,.2); z-index:30;
}

/* Content */
.content{ min-width:0; padding:1rem 1.25rem; }

/* Mobile Drawer */
@media (max-width:900px){
  .shell{ grid-template-columns: 1fr; }
  .topbar{ display:flex }
  .sidebar{
    position:fixed; left:0; top:0; width:280px; height:100vh;
    transform:translateX(-100%); transition:transform .2s ease; box-shadow:0 8px 24px rgba(0,0,0,.12);
  }
  .sidebar.open{ transform:translateX(0) }
  .content{ padding:1rem }
}
.overlay{ position:fixed; inset:0; background:rgba(0,0,0,.25); z-index:15 }

/* Collapsed (Desktop) */
.shell.collapsed{ grid-template-columns: 72px 1fr; }
.shell.collapsed .sidebar{ width:72px }
.shell.collapsed .title, .shell.collapsed .nav-link .t, .shell.collapsed .ver { display:none }
.shell.collapsed .collapse-btn{ transform:rotate(180deg) }

/* Tooltips nur im Collapsed-Zustand */
.shell.collapsed .nav-link[data-title]:hover::after{
  content: attr(data-title);
  position: absolute; left: 72px; top:50%; transform:translateY(-50%);
  background:#111; color:#fff; padding:.25rem .5rem; border-radius:.4rem; white-space:nowrap; box-shadow:0 2px 10px rgba(0,0,0,.2); z-index:30;
}
</style>
