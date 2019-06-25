sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"../Formatter"
], function(Controller, Filter, Sorter, JSONModel, ODataModel, MessageToast, MessageBox, Formatter) {
	"use strict";

	return Controller.extend("com.ui5ProductsManagement.controller.Products", {

		onInit: function() {
			
		},
		
		onAfterRendering:function(){
			//Nothwind Odata Model
			this.oNorthwindModel = new ODataModel(this.getView().getModel("i18n").getResourceBundle().getText("northwindURL"));
			this._loadProductsFromNorthwind();
		},

		_loadProductsFromNorthwind: function() {
			//load product data from Northwind
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
					//create model with result data
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


		onFilterSearch: function(oEvent) {
			//Filter Search handler
			var inPrdId = this.getView().byId("idPrdId").getValue();
			var inPrdName = this.getView().byId("idPrdName").getValue();
			var inPrdDesc = this.getView().byId("idPrdDesc").getValue();
			var inPrdPrice = this.getView().byId("idPrdPrice").getValue();
			var idnrdRelDate = this.getView().byId("idPrdRelDate").getValue();

			var aFilters = [];
			//add all the filters
			if (inPrdId && inPrdId.length > 0) {
				var inPrdIdFilter = new Filter("ID", sap.ui.model.FilterOperator.EQ, inPrdId);
				aFilters.push(inPrdIdFilter);
			}
			if (inPrdName && inPrdName.length > 0) {
				var inPrdNameFilter = new Filter("Name", sap.ui.model.FilterOperator.Contains, inPrdName);
				aFilters.push(inPrdNameFilter);
			}
			if (inPrdDesc && inPrdDesc.length > 0) {
				var inPrdDescFilter = new Filter("Description", sap.ui.model.FilterOperator.Contains, inPrdDesc);
				aFilters.push(inPrdDescFilter);
			}
			if (inPrdPrice && inPrdPrice.length > 0) {
				var inPrdPriceFilter = new Filter("Price", sap.ui.model.FilterOperator.Contains, inPrdPrice);
				aFilters.push(inPrdPriceFilter);
			}
			if (idnrdRelDate && idnrdRelDate.length > 0) {
				var idnrdRelDateFilter = new Filter("ReleaseDate", sap.ui.model.FilterOperator.Contains, idnrdRelDate);
				aFilters.push(idnrdRelDateFilter);
			}
			
			//update bindings
			var list = this.byId("idPrdList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},

		onLiveSearch: function(oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = [
					new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, sQuery),
					new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("Description", sap.ui.model.FilterOperator.Contains, sQuery)
				];
				aFilters = new sap.ui.model.Filter(filter, false);
			}
			// update list binding
			var list = this.byId("idPrdList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},

		handleSortButtonPressed: function() {
			//sort button handler
			this._createSortsDialog("com.ui5ProductsManagement.view.sortDialog").open();
		},

		_createSortsDialog: function(sDialogFragmentName) {
			//create sort dialog
			if (!this._oSortDialog) {
				// create dialog via fragment factory
				this._oSortDialog = sap.ui.xmlfragment(this.getView().getId(), sDialogFragmentName, this);
				// connect dialog to view (models, lifecycle)
				this.getView().addDependent(this._oSortDialog);
			}
			return this._oSortDialog;
		},

		handleSortDialogConfirm: function(oEvent) {
			//sort dialog confirm
			var oList = this.byId("idPrdList"),
				mParams = oEvent.getParameters(),
				oBinding = oList.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		onCreate: function(oEvent) {
			//show create Dialog
			this._getCreateDialog().open();

		},

		_getCreateDialog: function() {
			// create dialog lazily
			if (!this._createDialog) {
				// create dialog via fragment factory
				this._createDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ui5ProductsManagement.view.createProduct", this);
				// connect dialog to view (models, lifecycle)
				this.getView().addDependent(this._createDialog);
			}
			return this._createDialog;
		},

		closCreateeDialog: function() {
			//close the dialog
			this._createDialog.close();
		},

		createProduct: function(oEvent) {
			//create operation logic
			var ctrlObj = this;
			if (ctrlObj.byId("idCPrdID").getValue() != "" && ctrlObj.byId("idCPrdName").getValue() != "" && ctrlObj.byId("idCPrdDesc").getValue() !=
				"" && ctrlObj.byId("idCPrdPrice").getValue() != "" && ctrlObj.byId("idCPrdRating").getValue() != "" && ctrlObj.byId(
					"idCPrdRelDate").getValue() != "" && ctrlObj.byId("idCDiscDate").getValue() != "") {
				var createStr = {};
				createStr.Description = ctrlObj.byId("idCPrdDesc").getValue();
				createStr.DiscontinuedDate = ctrlObj.byId(
					"idCDiscDate").getValue();
				createStr.ReleaseDate = ctrlObj.byId("idCPrdRelDate").getValue();
				createStr.ID = parseInt(ctrlObj.byId(
					"idCPrdID").getValue(), 10);
				createStr.Name = ctrlObj.byId("idCPrdName").getValue();
				createStr.Price = ctrlObj.byId("idCPrdPrice")
					.getValue();
				createStr.Rating = parseInt(ctrlObj.byId("idCPrdRating").getValue(), 10);

				this.oNorthwindModel.create("/Products", createStr, {
					method: "POST",
					success: function(data) {
						//Success callback
						MessageToast.show("Create Successful");
						ctrlObj._createDialog.close();
						ctrlObj._loadProductsFromNorthwind();
					},
					error: function(oError) {
						//Error Callback
						MessageToast.show("Error occured, HTTP:" + oError.response.statusCode + ", " + oError.response.statusText);
					}
				});
			} else {
				MessageToast.show("Please fill all the fields first.");
			}
		},

		onUpdate: function(oEvent) {
			//show update dialog
			var ctrlObj = this;
			var contexts = this.getView().byId("idPrdList").getSelectedContexts();
			if (contexts.length === 0) {
				MessageToast.show("Select a Product First");
			} else {
				this._getUpdateDialog().open();
				contexts.map(function(c) {
					ctrlObj.byId("idUPrdID").setText(c.getObject().ID);
					ctrlObj.byId("idUPrdName").setValue(c.getObject().Name);
					ctrlObj.byId("idUPrdDesc").setValue(c.getObject().Description);
					ctrlObj.byId("idUPrdPrice").setValue(c.getObject().Price);
					ctrlObj.byId("idUPrdRating").setValue(c.getObject().Rating);
					ctrlObj.byId("idUPrdRelDate").setValue(c.getObject().ReleaseDate);
					ctrlObj.byId("idUDiscDate").setValue(c.getObject().DiscontinuedDate);
				});
			}
		},

		_getUpdateDialog: function() {
			// create dialog lazily
			if (!this._updateDialog) {
				// create dialog via fragment factory
				this._updateDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ui5ProductsManagement.view.updateProduct", this);
				// connect dialog to view (models, lifecycle)
				this.getView().addDependent(this._updateDialog);
			}
			return this._updateDialog;
		},

		closUpdateDialog: function() {
			//close the dialog
			this._updateDialog.close();
		},

		updateProduct: function(oEvent) {
			//update operation logic
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});

			var ctrlObj = this;
			if (ctrlObj.byId("idUPrdName").getValue() != "" && ctrlObj.byId("idUPrdDesc").getValue() !=
				"" && ctrlObj.byId("idUPrdPrice").getValue() != "" && ctrlObj.byId("idUPrdRating").getValue() != "" && ctrlObj.byId(
					"idUPrdRelDate").getValue() != "" && ctrlObj.byId("idUDiscDate").getValue() != "") {
				var updStr = {};
				updStr.Description = ctrlObj.byId("idUPrdDesc").getValue();
				updStr.DiscontinuedDate = oDateFormat.format(new Date(ctrlObj.byId("idUDiscDate").getValue()));
				updStr.ReleaseDate = oDateFormat.format(new Date(ctrlObj.byId("idUPrdRelDate").getValue()));
				updStr.ID = parseInt(ctrlObj.byId("idUPrdID").getText(), 10);
				updStr.Name = ctrlObj.byId("idUPrdName").getValue();
				updStr.Price = ctrlObj.byId("idUPrdPrice").getValue();
				updStr.Rating = parseInt(ctrlObj.byId("idUPrdRating").getValue(), 10);

				this.oNorthwindModel.update("/Products(" + updStr.ID + ")", updStr, {
					method: "PUT",
					success: function(data) {
						//Success callback
						MessageToast.show("Update Successful");
						ctrlObj._updateDialog.close();
						ctrlObj._loadProductsFromNorthwind();
					},
					error: function(oError) {
						//Error Callback
						MessageToast.show("Error occured, HTTP:" + oError.response.statusCode + ", " + oError.response.statusText);
					}
				});
			} else {
				MessageToast.show("Please fill all the fields first.");
			}
		},

		onDelete: function() {
			//delete logic
			var ctrlObj = this;
			var contexts = this.getView().byId("idPrdList").getSelectedContexts();

			if (contexts.length === 0) {
				MessageToast.show("Select a Product First");
			} else {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					"Do you really want to Delete this Product?", {
						title: "Delete",
						actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction == "DELETE") {
								var selIndex = contexts[0].getPath().split("/")[2];
								var selPrdID= contexts[0].getModel().getData().ProductList[selIndex].ID;
								ctrlObj.oNorthwindModel.remove("/Products(" + selPrdID + ")", {
									method: "DELETE",
									success: function(data) {
										//Success callback
										ctrlObj._loadProductsFromNorthwind();
										MessageToast.show("Product Deleted Successful");
									},
									error: function(oError) {
										//Error Callback
										MessageToast.show("Error occured, HTTP:" + oError.response.statusCode + ", " + oError.response.statusText);
									}
								});
							}
						}
					}
				);
			}
		},

		showChart: function() {
			//show char view
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ProductCharts");
		}

		//******** Process Flow Logics - commented as Northwind OData implemented ******//

		/*openProcessFlow: function(oEvent) {
			//show Process flow Dialog
			var contexts = this.getView().byId("idPrdList").getSelectedContexts();
			var ctrlObj = this;
			if (contexts.length === 0) {
				MessageToast.show("Select a Product First");
			} else {
				//show create Dialog
				ctrlObj._getProcessFlowDialog().open();
				//some logic for process flow
				var oProcessFlow = ctrlObj.byId("processflow");
				var selIndex = contexts[0].getPath().split("/")[2];
				var oModel = ctrlObj.getView().getModel("products");
				var obj = oModel.getData().ProductList[selIndex];

				//Set Product Node Values
				if (obj.prdStatus === "Active") {
					oProcessFlow.getNodes()[0].setState("Positive");
				} else {
					oProcessFlow.getNodes()[0].setState("Negative");
				}
				oProcessFlow.getNodes()[0].setStateText(obj.prdStatus);
				oProcessFlow.getNodes()[0].setTitle(obj.name);
				oProcessFlow.getNodes()[0].setTitleAbbreviation(obj.name);
				oProcessFlow.getNodes()[0].setTexts(obj.id);

				//Set Warehouse Node
				if (obj.wareTransfStatus === "Not Started") {
					oProcessFlow.getNodes()[1].setState("Negative");
				} else if (obj.wareTransfStatus === "In Progress") {
					oProcessFlow.getNodes()[1].setState("Neutral");
				} else {
					oProcessFlow.getNodes()[1].setState("Positive");
				}
				oProcessFlow.getNodes()[1].setStateText(obj.wareTransfStatus);

				//set Packaging Node
				if (obj.packingStatus === "Not Started") {
					oProcessFlow.getNodes()[2].setState("Negative");
				} else if (obj.packingStatus === "In Progress") {
					oProcessFlow.getNodes()[2].setState("Neutral");
				} else {
					oProcessFlow.getNodes()[2].setState("Positive");
				}
				oProcessFlow.getNodes()[2].setStateText(obj.packingStatus);

				ctrlObj.byId("processflow").zoomIn();
				ctrlObj.byId("processflow").zoomOut();
				ctrlObj.getView().getModel("processFlow").refresh();
			}
		},

		_getProcessFlowDialog: function() {
			// create dialog lazily
			if (!this._processFlowDialog) {
				// create dialog via fragment factory
				this._processFlowDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ui5ProductsManagement.view.processFlow", this);
				// connect dialog to view (models, lifecycle)
				this.getView().addDependent(this._processFlowDialog);
			}
			return this._processFlowDialog;
		},

		closeProcessFlowDialog: function() {
			//close dialog
			this._processFlowDialog.close();
		},

		onZoomIn: function() {
			//zoom in process flow
			this.byId("processflow").zoomIn();
		},

		onZoomOut: function() {
			//zoom out process flow
			this.byId("processflow").zoomOut();
		}*/

	});
});