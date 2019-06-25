sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel",
	"sap/m/MessageToast"
], function(Controller, ODataModel, MessageToast) {
	"use strict";
	return Controller.extend("com.ui5ProductsManagement.controller.ProductCharts", {
		onInit: function() {

			//pie chart setting
			this._configureChart(this.getView().byId("idPieVizFrame"), "Pie Chart");
			//donut char setting
			this._configureChart(this.getView().byId("idDonutVizFrame"), "Donut Chart");
			//column chart setting
			this._configureChart(this.getView().byId("idColumnVizFrame"), "Column Chart");

			//router initialization
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("ProductCharts").attachMatched(this._onRouteMatched, this);

		},
		
		onAfterRendering:function(){
			//Nothwind Odata Model
			this.oNorthwindModel = new ODataModel(this.getView().getModel("i18n").getResourceBundle().getText("northwindURL"));
			this._loadProductsFromNorthwind();
		},

		_onRouteMatched: function(oEvent) {
			//when navigated from Products screen
			this.oNorthwindModel = new ODataModel(this.getView().getModel("i18n").getResourceBundle().getText("northwindURL"));
			this._loadProductsFromNorthwind();
		},

		_loadProductsFromNorthwind: function() {
			//load Products data
			var aProducts = [];
			var contrlObj = this;
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "MM-dd-yyyy"
			});
			this.oNorthwindModel.read("/Products", {
				success: function(data) {
					// success callback - collect all the records
					for (var i = 0; i < data.results.length; i++) {
						var productJson = {};
						productJson.Description = data.results[i].Description;
						productJson.DiscontinuedDate = oDateFormat.format(data.results[i].DiscontinuedDate);
						productJson.ID = data.results[i].ID;
						productJson.Name = data.results[i].Name;
						productJson.Price = data.results[i].Price;
						productJson.Rating = data.results[i].Rating;
						productJson.ReleaseDate = oDateFormat.format(data.results[i].ReleaseDate);
						aProducts.push(productJson);
					}
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setProperty("/ProductList", aProducts);
					contrlObj.getView().setModel(oModel);

				},
				error: function(oError) {
					//Error Callback
					MessageToast.show("Error occured, HTTP:" + oError.response.statusCode + ", " + oError.response.statusText);
				}
			});
		},

		_configureChart: function(oVizFrame, chartName) {
			//configure chart	
			oVizFrame.setModel(this.getView().getModel("products"));
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					dataLabel: {
						showTotal: true
					}
				},
				tooltip: {
					visible: true
				},
				title: {
					text: chartName
				}
			});
		},

		onNavButtonPress: function() {
			//back button handler
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Products");
		}
	});
});