<template>
  <q-layout view="lHh Lpr lFf" v-if="route === 'authenticated'">
    <q-header bordered class="bg-white text-grey-8">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-avatar>
            <img src="icon.png" />
          </q-avatar>
          <span class="gt-xs q-ml-xs">Crawler Verification Tool</span>
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn flat no-caps>
            <q-avatar round text-color="white" color="primary">
              <span>
                {{ email.charAt(0).toUpperCase() }}
              </span>
            </q-avatar>
            <span class="q-pl-xs" v-if="$q.screen.gt.xs">{{ email }}</span>
            <q-menu
              anchor="bottom end"
              self="top end"
              transition-show="fade"
              transition-hide="fade"
              style="min-width: 200px"
            >
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="signOut">
                  <q-item-section side>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Sign out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered mini show-if-above>
      <q-list padding class="text-grey-8">
        <q-item-label header> Menu </q-item-label>
        <q-item
          v-ripple
          v-for="link in links"
          :key="link.text"
          clickable
          :to="link.to"
          active-class="bg-teal-1 text-grey-8"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <authenticator :login-mechanisms="['email']" variation="modal">
    <template v-slot:header>
      <div class="text-center q-pa-xs">
        <q-avatar size="150px">
          <img src="icon.png" />
        </q-avatar>
      </div>
    </template>

    <template v-slot:footer>
      <div style="padding: var(--amplify-space-large); text-align: center">
        <p class="amplify-text" style="color: var(--amplify-colors-neutral-80)">
          © {{ year }} codewithyou. All Rights Reserved
        </p>
      </div>
    </template>
  </authenticator>
</template>

<script>
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-vue';
// eslint-disable-next-line object-curly-newline
import { defineComponent, ref, toRefs, computed, onUnmounted } from 'vue';

const linksList = [
  { icon: 'home', text: 'Work', to: { name: 'work' } },
  { icon: 'task', text: 'Tasks', to: { name: 'tasks' } }
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    Authenticator
  },

  setup() {
    const leftDrawerOpen = ref(false);
    // `route` `user` and `signOut` all are reactive.
    const { route, user, signOut } = toRefs(useAuthenticator());

    const email = computed(() => user.value.attributes?.email);

    onUnmounted(() => {});

    return {
      links: linksList,
      leftDrawerOpen,
      route,
      user,
      email,
      signOut,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      year: new Date().getFullYear()
    };
  }
});
</script>
