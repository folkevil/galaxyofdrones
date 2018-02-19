import { EventBus } from './event-bus';
import Cargo from './Cargo';
import Modal from './Modal';

export default Modal.extend({
    props: ['types', 'unitTypes', 'urls'],

    mixins: [
        Cargo
    ],

    data() {
        return {
            type: undefined,
            selected: {
                id: undefined,
                travel_time: 0
            }
        };
    },

    created() {
        EventBus.$on('move-click', this.open);
    },

    computed: {
        isScoutType() {
            return this.type === this.types.scout;
        },

        isAttackType() {
            return this.type === this.types.attack;
        },

        isOccupyType() {
            return this.type === this.types.occupy;
        },

        isSupportType() {
            return this.type === this.types.support;
        },

        isTransportType() {
            return this.type === this.types.transport;
        },

        canScout() {
            return this.quantity.hasOwnProperty(this.scoutUnit.id)
                && this.quantity[this.scoutUnit.id] > 0
                && this.quantity[this.scoutUnit.id] <= this.scoutUnit.quantity;
        },

        canOccupy() {
            return this.settlerUnit.quantity > 0;
        },

        hasUnits() {
            const quantity = _.pickBy(this.quantity);
            let hasUnits = false;

            _.forEach(this.planet.units, unit => {
                if (quantity.hasOwnProperty(unit.id)) {
                    return hasUnits = quantity[unit.id] > 0 && quantity[unit.id] <= unit.quantity;
                }
            });

            return hasUnits;
        },

        hasFighterUnits() {
            const quantity = _.pickBy(this.quantity);
            let hasFighterUnits = false;

            _.forEach(this.fighterUnits, unit => {
                if (quantity.hasOwnProperty(unit.id)) {
                    return hasFighterUnits = quantity[unit.id] > 0 && quantity[unit.id] <= unit.quantity;
                }
            });

            return hasFighterUnits;
        },

        scoutUnit() {
            return _.find(
                this.planet.units, unit => unit.type === this.unitTypes.scout
            );
        },

        settlerUnit() {
            return _.find(
                this.planet.units, unit => unit.type === this.unitTypes.settler
            );
        },

        fighterUnits() {
            return _.filter(
                this.planet.units, unit => unit.type === this.unitTypes.fighter || unit.type === this.unitTypes.heavyFighter
            );
        },

        travelTime() {
            return Math.round(
                this.selected.travel_time / this.slowestUnitSpeed
            );
        },

        slowestUnitSpeed() {
            if (this.isScoutType) {
                return this.scoutUnit.speed;
            }

            if (this.isOccupyType) {
                return this.settlerUnit.speed;
            }

            if (this.isTransportType) {
                return this.transporterUnit.speed;
            }

            if (this.isSupportType && this.hasUnits) {
                const quantity = _.pickBy(this.quantity);

                return _.get(_.minBy(
                    _.filter(this.planet.units, unit => quantity.hasOwnProperty(unit.id)), 'speed'
                ), 'speed', 1);
            }

            if (this.isAttackType && this.hasFighterUnits) {
                const quantity = _.pickBy(this.quantity);

                return _.get(_.minBy(
                    _.filter(this.fighterUnits, unit => quantity.hasOwnProperty(unit.id)), 'speed'
                ), 'speed', 1);
            }

            return 1;
        }
    },

    methods: {
        open(type, selected) {
            this.type = type;
            this.selected = selected;
            this.quantity = {};
            this.$nextTick(() => this.$modal.modal());
        },

        scout() {
            axios.post(this.urls.scout.replace('__planet__', this.selected.id), {
                quantity: this.quantity[this.scoutUnit.id]
            }).then(this.close);
        },

        attack() {
            axios.post(this.urls.attack.replace('__planet__', this.selected.id), {
                quantity: this.quantity
            }).then(this.close);
        },

        occupy() {
            axios.post(
                this.urls.occupy.replace('__planet__', this.selected.id)
            ).then(this.close);
        },

        support() {
            axios.post(this.urls.support.replace('__planet__', this.selected.id), {
                quantity: this.quantity
            }).then(this.close);
        },

        transport() {
            axios.post(this.urls.transport.replace('__planet__', this.selected.id), {
                quantity: this.quantity
            }).then(this.close);
        }
    }
});