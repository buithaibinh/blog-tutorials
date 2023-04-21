<template>
  <q-form
    @submit="save"
    ref="formRef"
    greedy
    no-error-focus
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false"
  >
    <q-list separator>
      <!-- heading -->
      <q-item-label header class="text-body2 text-weight-bold"
        >Start Urls</q-item-label
      >
      <q-item v-for="(item, index) in startUrls" :key="index" ref="itemRefs">
        <q-item-section avatar top>
          <q-icon name="account_tree" color="black" size="34px" />
        </q-item-section>
        <q-item-section top>
          <q-item-label lines="1">
            <q-input
              v-model.trim="item.url"
              :label="`URL ${index + 1}`"
              dense
              outlined
              hide-bottom-space
              :readonly="item.readonly"
              :rules="urlRules"
              lazy-rules
            >
              <template v-slot:append>
                <!-- open in new tab -->
                <q-btn
                  v-if="item.url && item.url.length > 0"
                  flat
                  dense
                  round
                  icon="open_in_new"
                  @click="openInNewTab(item.url)"
                />
              </template>
            </q-input>
          </q-item-label>
          <q-item-label lines="1" class="q-mt-xs text-body2">
            <q-select
              v-model="item.categories"
              use-input
              use-chips
              multiple
              outlined
              dense
              hide-dropdown-icon
              hide-bottom-space
              input-debounce="0"
              new-value-mode="add-unique"
              :readonly="item.readonly"
            >
              <template v-slot:before>
                <span class="text-grey-8 text-subtitle2" style="width: 100px"
                  >Categories
                </span>
              </template>
            </q-select>
          </q-item-label>
          <q-item-label lines="1" class="q-mt-xs">
            <q-select
              v-model="item.linkSelector"
              use-input
              use-chips
              multiple
              outlined
              dense
              hide-dropdown-icon
              hide-bottom-space
              input-debounce="0"
              new-value-mode="add-unique"
              :readonly="item.readonly"
              :rules="[
                (linkSelector) =>
                  (linkSelector && linkSelector.length > 0) ||
                  'Please input a link selector'
              ]"
            >
              <template v-slot:hint v-if="index === 0 && startUrls.length > 1">
                <q-btn
                  color="primary"
                  flat
                  no-caps
                  label="Copy [Selector] to all following StartURLs"
                  @click="doCopySelectorToAllFollowingStartUrls(index)"
                />
              </template>

              <template v-slot:after>
                <q-btn
                  color="primary"
                  outline
                  icon="web"
                  no-caps
                  :disable="item.readonly"
                  @click="onPick(item)"
                >
                  <span class="gt-xs">Pick by browser</span>
                </q-btn>
                <q-icon name="help" class="cursor-pointer gt-xs q-pl-xs">
                  <q-popup-proxy>
                    <q-banner>
                      You need install the extension to pick the selector.
                      <br />
                      <a
                        href="https://chrome.google.com/webstore/detail/css-selector/ajajpdillpelmpfbgeopndgfihgkagim"
                        target="_blank"
                        >CSS Selector</a
                      >
                    </q-banner>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:before>
                <span class="text-grey-8 text-subtitle2" style="width: 100px"
                  >Link Selectors
                </span>
              </template>
            </q-select>
          </q-item-label>
        </q-item-section>

        <q-item-section top side>
          <div class="text-grey-8 q-gutter-xs">
            <q-btn flat round icon="delete" @click="onRemove(index)">
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                Remove
              </q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              :icon="item.readonly ? 'lock' : 'lock_open'"
              :color="item.readonly ? 'primary' : 'grey-8'"
              :disable="!isValid(item)"
              @click="onDone(item)"
            >
              <q-tooltip class="bg-indigo" :offset="[10, 10]">
                {{ item.readonly ? 'Edit' : 'Done' }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
      <!-- add more button -->
      <div class="row q-pa-sm">
        <q-btn
          color="primary"
          outline
          icon="add"
          no-caps
          @click="onAdd"
          style="max-width: 150px"
          dense
          :disable="!canAddMore"
        >
          <span class="gt-xs">Add StartURL</span>
        </q-btn>
      </div>
    </q-list>
  </q-form>
</template>

<!-- eslint-disable operator-linebreak -->
<script>
import { useQuasar, openURL } from 'quasar';
import { ref, computed, watch } from 'vue';

import { popupCenter } from 'src/utils';

export default {
  props: {
    urls: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const $q = useQuasar();

    const startUrls = ref(props.urls);

    // watch props change
    const watchUrls = (val) => {
      console.log('watchUrls', val.urls);
      startUrls.value = val.urls;
    };
    watch(props, watchUrls, { deep: true });

    const timer = ref(null);
    const formRef = ref(null);
    const urlRules = [
      (url) => {
        // validate url by regex
        const urlRegex =
          /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

        return urlRegex.test(url) || 'Please input a valid url';
      }
    ];

    const win = ref(null);

    const isValidUrl = (item) => {
      const { url } = item;
      return urlRules[0](url) === true;
    };

    const isValid = (item) => {
      // validate form here
      const isOk = isValidUrl(item);
      const isValidLinkSelector =
        item.linkSelector && item.linkSelector.length > 0;

      if (isOk && isValidLinkSelector) {
        return true;
      }
      return false;
    };

    const onAdd = () => {
      startUrls.value.push({
        url: '',
        categories: []
      });
    };

    const onRemove = (index) => {
      startUrls.value.splice(index, 1);
    };

    const onDone = (item) => {
      if (!item.readonly) {
        if (!isValid(item)) {
          $q.notify({
            type: 'negative',
            message: 'Please input a valid url and link selector'
          });
          return;
        }
      }
      item.readonly = !item.readonly;
    };

    const canAddMore = computed(() => {
      if (startUrls.value.length === 0) {
        return true;
      }

      const lastItem = startUrls.value[startUrls.value.length - 1];
      return isValid(lastItem);
    });

    const onPick = (item) => {
      const isOK = isValidUrl(item);

      if (!isOK) {
        $q.notify({
          message: 'Please input a valid URL'
        });
        return;
      }

      // eslint-disable-next-line no-undef
      const { url } = item;
      const link = new URL(url);
      link.searchParams.set('action', 'pick-css-selector');

      // close previous window
      if (win.value) {
        win.value.close();
      }

      win.value = popupCenter({
        url: link,
        title: 'xtf',
        w: (2 * $q.screen.width) / 3,
        h: $q.screen.height - 100
      });

      // check if window is closed
      if (timer.value) {
        clearInterval(timer.value);
      }
      timer.value = setInterval(async () => {
        if (win.value.closed) {
          clearInterval(timer.value);
          let text = await navigator.clipboard.readText();
          // if text is not come from CSS selector, ignore it
          if (!text.startsWith('[CSS Selector]')) {
            return;
          }

          // remove prefix
          text = text.replace('[CSS Selector]', '').trim();

          // set value
          item.linkSelector = text.split(',').map((t) => `${t.trim()} a`);

          // notify
          $q.notify({
            message: 'CSS Selector picked!',
            color: 'positive'
          });
        }
      }, 1000);
    };

    const save = async () => {
      // validate form here before save
      const success = await formRef.value.validate();
      return success && startUrls.value;
    };

    const doCopySelectorToAllFollowingStartUrls = (index) => {
      const item = startUrls.value[index];
      const { linkSelector } = item;
      if (!linkSelector || linkSelector.length === 0) {
        return;
      }

      // eslint-disable-next-line no-plusplus
      for (let i = index + 1; i < startUrls.value.length; i++) {
        startUrls.value[i].linkSelector = linkSelector;
      }
    };

    const openInNewTab = (url) => {
      openURL(url);
    };

    return {
      startUrls,
      isValidUrl,
      isValid,
      onAdd,
      onRemove,
      onDone,
      onPick,
      canAddMore,
      save,
      formRef,
      urlRules,
      doCopySelectorToAllFollowingStartUrls,
      openInNewTab
    };
  }
};
</script>

<style lang="scss" scoped></style>
