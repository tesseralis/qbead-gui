<script lang="ts">
	import { basicSetup } from 'codemirror';
	import { EditorView } from '@codemirror/view';
	import { javascript } from '@codemirror/lang-javascript';
	import { onMount } from 'svelte';

	interface Props {
		title: string;
		initText: string;
		onapply(text: string): void;
	}
	const { title, initText, onapply }: Props = $props();
	let codeDiv = $state<HTMLElement | undefined>();
	let view: EditorView;

	onMount(() => {
		view = new EditorView({
			doc: initText,
			parent: codeDiv,
			extensions: [basicSetup, javascript()]
		});
	});
</script>

<div class="function">
	<h2>{title}</h2>
	<div bind:this={codeDiv}></div>
	<button onclick={() => onapply(view.state.doc.toString())}>Apply</button>
</div>

<style>
	.function {
		display: flex;
		flex-direction: column;
	}
</style>
