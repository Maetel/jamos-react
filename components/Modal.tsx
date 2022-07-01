export {};

// export default function Modal(props) {
//   return (

// <div class="container">
//   <div class="background" on:click={(e) => procmgr.closeModal()} />
//   <div class="contents-container" bind:this={modalElem}>
//     <div class="contents">
//       <div class="title">
//         {$modalStore.title}
//       </div>
//       {#if $modalStore.descs}
//         <div class="descs">
//           {#each $modalStore.descs as desc}
//             <div class="desc">{desc}</div>
//           {/each}
//         </div>
//       {/if}
//       {#if $modalStore.comp}
//         <svelte:component this={$modalStore.comp} data={$modalStore.compData} />
//       {/if}

//       <div class="buttons" bind:this={buttons}>
//         {#each $modalStore.buttons as btn, i (i)}
//           <button
//             class="btn"
//             on:click={() => {
//               const res = $modalStore.callbacks[i]();
//               updateModalResult(res);
//               procmgr.closeModal();
//             }}>{btn}</button
//           >
//         {/each}
//       </div>
//     </div>
//   </div>
//   <div class="css-keeper contents-container active" />
// </div>
//   )
// }
