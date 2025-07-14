<script lang="ts">
	import 'core-js/features/symbol/observable.js';
	import Docs from './Docs.svelte';
	import QBeadPanel from './QBeadPanel.svelte';
	import lzString from 'lz-string';
	import QBead from './QBead.svelte';

	interface Handlers {
		onTap?: string;
		onAccelUpdate?: string;
	}

	interface HandlerFuncs {
		onTap?: Function;
		onAccelUpdate?: Function;
	}

	let qBeads = $state<QBead[]>([]);
	const hash = window.location.hash.slice(1);
	const handlerText = JSON.parse(lzString.decompressFromEncodedURIComponent(hash)) ?? [];
	let handlerList = $state<Handlers[]>(handlerText);
	const handlerFuncs = $derived(
		handlerList.map((handlers, index) => {
			const handlerFuncs: HandlerFuncs = {};
			for (let funcName of ['onTap', 'onAccelUpdate'] as const) {
				const func = new Function('{ qBeads, self }', handlers[funcName] || '');
				handlerFuncs[funcName] = () => {
					func({ qBeads, self: qBeads[index] });
				};
			}
			return handlerFuncs;
		})
	);

	// TODO this feels like a huge hack. There's got to be a more elegant way to do this.
	$effect(() => {
		handlerFuncs.forEach((funcs, i) => {
			if (qBeads[i]) {
				qBeads[i].handlers = funcs;
			}
		});
	});

	function addPanel() {
		handlerList.push({});
	}
</script>

<div>
	<Docs />
	<button onclick={addPanel}>+ Add Panel</button>
	<div class="qBeadPanels">
		{#each handlerList as _, i}
			<QBeadPanel index={i} handlerFuncs={handlerFuncs[i]} bind:qBeads bind:handlerList />
		{/each}
	</div>
</div>

<style>
	.qBeadPanels {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
</style>
