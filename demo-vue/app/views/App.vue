<template>
    <Page>
        <GridLayout rows="auto,*">
            <SVGView blendingMode="lighten" height="30%" src="~/assets/svgs/Ghostscript_Tiger.svg" stretch="aspectFit" backgroundColor="transparent" @tap="onTap"/>
            <CollectionView row="1" rowHeight="180" ref="listView" :items="itemList" @itemTap="onItemTap" itemIdGenerator="index">
                <v-template>
                    <GridLayout>
                        <CanvasSVG @tap="refreshCanvas">
                            <Rectangle left="0" width="50" height="100%" color="red" horizontalAlignment="left" />

                            <Line id="line" :antiAlias="true" color="yellow" startX="10%" startY="34%" stopX="90%" stopY="90%" strokeCap="round" strokeJoin="round" strokeWidth="4" dash="1 10 0" />
                            <CSVG cache="false" horizontalAlignment="center" src="~/assets/svgs/MenuButton.svg" width="10" height="30" stretch="aspectFit" />
                            <CSVG horizontalAlignment="left" src="~/assets/svgs/ShareButton.svg" height="100%" stretch="aspectFit" />
                        </CanvasSVG>
                    </GridLayout>
                </v-template>
            </CollectionView>
        </GridLayout>
    </Page>
</template>

<script lang="ts">
import { CanvasView } from '@nativescript-community/ui-canvas';
export default {
    data() {
        const items = new Array(1000).fill(null).map((v, i) => ({
            index: i,
        }));
        // console.log('items', JSON.stringify(items));

        return {
            itemList: items,
        };
    },
    methods: {
        refreshCanvas(event) {
            (event.object as CanvasView).redraw();
        },
        onItemTap({ index, item }) {
            console.log(`Tapped on ${index} ${item.title}`);
        },
        onTap(e) {
            e.object.src = '~/assets/svgs/MenuButton.svg'
        },
        logEvent(e) {
            console.log('logEvent', e.eventName, e.extraData);
        },
        // itemIdGenerator(item, i) {
        //   return item.index;
        // }
    },
};
</script>

<style scoped>
ActionBar {
    background-color: #53ba82;
    color: #ffffff;
}

.message {
    vertical-align: center;
    text-align: center;
    font-size: 20;
    color: #333333;
}
</style>
