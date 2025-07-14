<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { EditorView } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	import { onMount } from 'svelte';

	interface Props {
		title: string;
		text: string;
		// initText: string;
		// onapply(text: string): void;
	}
	let { title, text = $bindable('') }: Props = $props();
	let codeDiv = $state<HTMLElement | undefined>();
	let view: EditorView;

	onMount(() => {
		view = new EditorView({
			doc: text,
			parent: codeDiv,
			extensions: [basicSetup, javascript()]
		});
	});
</script>

<div class="function">
	<h2>{title}</h2>
	<div bind:this={codeDiv}></div>
	<button onclick={() => (text = view.state.doc.toString())}>Apply</button>
</div>

<style>
	.function {
		display: flex;
		flex-direction: column;
	}
</style>
