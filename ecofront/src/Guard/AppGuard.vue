<script setup>
import { computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

const props = defineProps({
  roles: { type: [String, Array], default: null },
  permissions: { type: [String, Array], default: null },
  mode: { type: String, default: 'hide' } // 'hide' yoki 'disable'
});

const hasAccess = computed(() => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const user = jwtDecode(token);
    
    if (!user || !Array.isArray(user.roles)) return false;

    const userRoles = [];
    const userPermissions = new Set();

    // Token ichidagi rollar va permissionlarni yig'ish
    user.roles.forEach(role => {
      // Rolning o'zi yoki .value maydoni (ID)
      const rVal = (role && typeof role === 'object') ? role.value : role;
      if (rVal) userRoles.push(String(rVal));

      // Rol ichidagi permissionlarning .value maydoni
      const perms = (role && typeof role === 'object') ? role.permissions : [];
      if (Array.isArray(perms)) {
        perms.forEach(p => {
          const pVal = (p && typeof p === 'object') ? p.value : p;
          if (pVal) userPermissions.add(String(pVal));
        });
      }
    });

    // 1. ROOT CHECK: Agar foydalanuvchi roli '1' bo'lsa, hamma narsaga ruxsat
    if (userRoles.includes('1')) return true;

    // 2. ROLE CHECK
    let roleOk = true;
    if (props.roles) {
      const required = Array.isArray(props.roles) ? props.roles.map(String) : [String(props.roles)];
      roleOk = required.some(r => userRoles.includes(r));
    }

    // 3. PERMISSION CHECK
    let permOk = true;
    if (props.permissions) {
      const required = Array.isArray(props.permissions) ? props.permissions.map(String) : [String(props.permissions)];
      permOk = required.some(p => userPermissions.has(p));
    }

    return roleOk && permOk;
  } catch (e) {
    return false;
  }
});
</script>

<template>
  <div v-if="hasAccess" class="guard-wrapper">
    <slot />
  </div>
  <div v-else-if="mode === 'disable'" class="guard-disabled opacity-50 pointer-events-none grayscale">
    <slot />
  </div>
</template>