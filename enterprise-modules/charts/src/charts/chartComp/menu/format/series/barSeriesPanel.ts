import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import {ChartController} from "../../../chartController";
import {ShadowPanel} from "./shadowPanel";
import {FontPanel, FontPanelParams} from "../fontPanel";
import {ChartTranslator} from "../../../chartTranslator";
import {BarChartProxy} from "../../../chartProxies/cartesian/barChartProxy";
import {initFillOpacitySlider, initFontPanelParams, initLineOpacitySlider} from "../widgetInitialiser";

export class BarSeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
                <ag-slider ref="seriesLineOpacitySlider"></ag-slider>
                <ag-slider ref="seriesFillOpacitySlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;
    @RefSelector('seriesLineOpacitySlider') private seriesLineOpacitySlider: AgSlider;
    @RefSelector('seriesFillOpacitySlider') private seriesFillOpacitySlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(BarSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("tooltip.enabled", newValue));
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("stroke.width"))
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("stroke.width", newValue));
    }

    private initOpacity() {
        initLineOpacitySlider(this.seriesLineOpacitySlider, this.chartTranslator, this.getChartProxy());
        initFillOpacitySlider(this.seriesFillOpacitySlider, this.chartTranslator, this.getChartProxy());
    }

    private initLabelPanel() {
        const params: FontPanelParams = initFontPanelParams(this.chartTranslator, this.getChartProxy());
        const labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartController));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    private getChartProxy(): BarChartProxy {
        return this.chartController.getChartProxy() as BarChartProxy;
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
