<details>
	<summary>API</summary>
	<ul>
		<li>
			<code>self</code> - the current QBead.
		</li>
		<li>
			<code>qBeads[i]</code> - the QBead at index i.
		</li>
	</ul>
	<h2><code>class QBead</code></h2>
	<ul>
		<li>
			<code>accel</code> - the acceleration data of the QBead as a
			<a href="https://qbead.gitbook.io/bloch-sphere/classes/blochvector">
				<code>BlochVector</code>
			</a>.
		</li>
		<li>
			<code>sphereCoord</code> - the currently highlighted spherical coordinate of the QBead as a
			<a href="https://qbead.gitbook.io/bloch-sphere/classes/blochvector">
				<code>BlochVector</code>
			</a>.
		</li>
		<li>
			<code>color</code> - the current color of the QBead.
		</li>
		<li>
			<code>setSphereCoord(value: BlochVector)</code> - set the sphere coordinates of the QBead to the
			given value.
		</li>
		<li>
			<code>setColor(value: ColorRepresentation)</code> - set the color of the QBead to the given value.
			Takes anything accepted as a Color in THREE.js.
		</li>
	</ul>
</details>
