<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of StockoutDetailViewModel
 *
 * @author nemo
 */
class StockoutDetailViewModel extends CommonViewModel {
    
    protected $viewFields = array(
        "StockoutDetail" => array("id","stockout_id", "factory_code_all","goods_id","stock_id","num", "_type"=>"left"),
        "Goods" => array("name"=>"goods_name", "goods_category_id", "_on"=>"Goods.id=StockoutDetail.goods_id", "_type"=>"left"),
        "Stock" => array("name"=>"stock_name", "_on"=>"Stock.id=StockoutDetail.stock_id", "_type"=>"left"),
        "StockProductList" => array("num"=>"store_num", "_on"=>"StockoutDetail.stock_id=StockProductList.stock_id and StockoutDetail.factory_code_all=StockProductList.factory_code_all", "_type"=>"left")
    );
    
}