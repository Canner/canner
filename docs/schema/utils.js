import React from 'react';
import {Tooltip, Icon} from 'antd';
import TableSelectColumn from "../components/columns/select";

export const galleryValidation = {
  validator: (content) => {
    if (content.length === 0) {
      return "should at least have one photo";
    }
  }
};

export function renderBuyer(buyerName, record) {
  const title = (
    <div>
      <div>Email: {record.buyerEmail}</div>
      <div>Phone: {record.buyerPhone}</div>
    </div>
  )
  return (
    <Tooltip title={title}>
      {buyerName}
    </Tooltip>
  )
}

export const renderSelect = (options, keyName) => (value, record, cannerProps) => (
  <TableSelectColumn
    value={value}
    options={options}
    dataKeyRefId={cannerProps.refId.child(`${record.__index}/${keyName}`)}
    cannerProps={cannerProps}
  />
)

export const renderOrderSelect = renderSelect([
  {
    value: "new",
    title: "New order",
    color: "red"
  },
  {
    value: "old",
    title: "Old order",
    color: "green"
  }
], 'orderStatus');

export const renderPaySelect = renderSelect([
    {
      value: "not",
      title: "Not paid",
      color: "red"
    },
    {
      value: "paid",
      title: "Paid",
      color: "green"
    }
], 'payStatus');

export const renderShipSelect = renderSelect([
  {
    value: "not",
    title: "Unshipped",
    color: "red"
  },
  {
    value: "shipping",
    title: "Shipping",
    color: "orange"
  },
  {
    value: "delivered",
    title: "Delivered",
    color: "green"
  }
], 'shipStatus');


export const visitorIcon = (
  <Icon type="user" theme="outlined" style={{color: "#e3f7ff"}} />
);

export const orderIcon = (
  <Icon type="dollar" theme="twoTone" />
)