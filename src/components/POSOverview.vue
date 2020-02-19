<template>
    <div>
        <h1>Overview</h1>
        <div id="component-box">
            <div id="own-pos">
                <b-card class="pos-card">
                    <b-card-title class="box-title">
                        my points of sale
                    </b-card-title>
                    <b-card-body>
                        <div id="pos-lable">
                            <b-card>
                                <div class="pos-display">
                                    Bar POS
                                </div>
                                <div class="pos-display">
                                    POS 1
                                </div>
                                <div class="pos-display">
                                    POS 2
                                </div>
                            </b-card>
                        </div>
                    </b-card-body>
                </b-card>
                <b-card class="page-selecter">
                    <b-card-body>
                        <div class="page-display">
                            PAGE 1/1
                        </div>
                    </b-card-body>
                </b-card>
            </div>
            <div id="request-pos">
                <b-card class="pos-card">
                    <b-card-title class="box-title">
                        requested points of sale
                    </b-card-title>
                    <b-card-body>
                        <div id="pos-lable">
                            <b-card>
                                <div class="pos-display">
                                    POS Request 1
                                </div>
                                <div class="pos-display">
                                    POS Request 2
                                </div>
                                <div class="pos-display">
                                    POS Request 3
                                </div>
                            </b-card>
                        </div>
                    </b-card-body>
                </b-card>
                <b-card class="page-selecter">
                    <b-card-body>
                        <div class="page-display">
                            PAGE 1/1
                        </div>
                    </b-card-body>
                </b-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class POSOverview extends Vue {
    @Prop() private msg!: string;
}
</script>

<style scoped lang="scss">
    @import './src/styles/Card.scss';

    #component-box {
        display: flex;
        justify-content: center;
    }

    #own-pos {
        padding-right: 15px;
    }

    .pos-card {
        width: 35rem;
        height: 35rem;
    }

    .pos-display {
        background-color: #f0f0f0;
        font-weight: bold;

        margin-bottom: .5rem;
        padding-top: 1rem;
        padding-left: 1rem;
        padding-bottom: 1rem;
    }

    .page-selecter {
        background-color: #f0f0f0;
    }

    .page-display {
        font-weight: bold;
    }

    .box-title {
        font-weight: bold;
    }
</style>
