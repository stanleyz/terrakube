import {
    InfoCircleOutlined
} from "@ant-design/icons";
import {
    Button,
    Col,
    Flex,
    Form,
    Input,
    InputRef,
    Popconfirm,
    Row,
    Space,
    Select,
    Spin,
    Switch,
    Table,
    message
} from "antd";
import { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import { v7 as uuid } from "uuid";
import { atomicHeader, renderVCSLogo } from "../Workspaces";

export const WorkspaceWebhook = ({
    workspace,
    vcsProvider,
    orgTemplates,
    manageWorkspace
}) => {
    const [waiting, setWaiting] = useState(true);
    const [webhookEnabled, setWebhookEnabled] = useState(false);
    const [recordIndex, setRecordIndex] = useState(1);
    const organizationId = workspace.relationships.organization.data.id;
    const [webhookEvents, setWebhookEvents] = useState([
        {
            key: '1',
            id: uuid(),
        },
    ]);
    const workspaceId = workspace.id;
    const [remoteHookId, setRemoteHookId] = useState("");
    const webhookId = workspace.relationships.webhook?.data?.id;

    useEffect(() => {
        setWaiting(true);
        loadWebhook();
        setWaiting(false);
    }, []);
    const loadWebhook = () => {
        if (!webhookId) {
            setWebhookEnabled(false);
            return;
        }
        setWebhookEnabled(true);
        try {
            axiosInstance.get(`organization/${organizationId}/workspace/${workspaceId}/webhook/${webhookId}`).then((response) => {
                const a = response.data.data.attributes.remoteHookId;
                setRemoteHookId(response.data.data.attributes.remoteHookId);
                console.log(response);
            });
            axiosInstance.get(`organization/${organizationId}/workspace/${workspaceId}/webhook/${webhookId}/events`).then((response) => {
                var i = recordIndex + 1;
                const events = response.data.data.map((event) => {
                    return {
                        key: i++,
                        id: event.id,
                        priority: event.attributes.priority,
                        event: event.attributes.event,
                        branch: event.attributes.branch,
                        file: event.attributes.path,
                        template: event.attributes.templateId,
                        created: true,
                    };
                });
                setRecordIndex(events.length + 1);
                setWebhookEvents(events.concat(webhookEvents));
            });
        }
        catch (error) {
            message.error("Failed to load webhook");
            console.log(error);
        }
        console.log(webhookEvents);
    };
    const handleEventChange = (index, key, name, value) => {
        webhookEvents[index][name] = value;
        if (index == webhookEvents.length - 1) {
            const index = recordIndex + 1;
            setWebhookEvents([...webhookEvents, {
                key: index,
                id: uuid(),
            }]);
            setRecordIndex(index);
        }
    };
    const handleWebhookClick = () => {
        setWebhookEnabled(!webhookEnabled);
    }
    const onDelete = (record) => {
        const newWebhookEvents = webhookEvents.filter((item) => item.key !== record.key);
        setWebhookEvents(newWebhookEvents);
    };
    const onFinish = (values) => {
        setWaiting(true);
        const body = {
            "atomic:operations": [
            {
                op: webhookId ? "update" : "add",
                href: `/organization/${organizationId}/workspace/${workspaceId}/webhook`,
                data: {
                    type: "webhook",
                    id: webhookId ? webhookId : uuid(),
                },
                relationships: {
                    events: {
                        data: webhookEvents.filter((item) => item.key == 1).map(function (event, index) {
                            return {
                                type: "webhook_event",
                                id: event.id,
                            };
                        }),
                    },
                },
            }, 
            ...webhookEvents.filter((item) => item.key == 1).map(function (event, index) {
                return {
                    op: event.created ? "update" : "add",
                    href: `/organization/${organizationId}/workspace/${workspaceId}/webhook/${webhookId}/events`,
                    data: {
                        type: "webhook_event",
                        id: event.id,
                        attributes: {
                            priority: event.priority ? event.priority : 1,
                            event: event.event.toUpperCase(),
                            branch: event.branch,
                            path: event.file,
                            templateId: event.template,
                        },
                    },
                };
            })]
        };

        axiosInstance.post("/operations", body, atomicHeader).then((response) => {
            console.log(response);
        });
        setWaiting(false);
    };
    const columns = [
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: "5%",
            render: (text, record, index) => (
                <Input placeholder="1"
                    name="priority"
                    value = {record.priority}
                    onChange={(e) => handleEventChange(index, record.key, e.target.name, e.target.value)}></Input>
            ),
        },
        {
            title: "Event",
            dataIndex: "event",
            key: "event",
            width: "8%",
            render: (text, record, index) => (
                <Select
                    placeholder="Select an event"
                    value = {record.event}
                    onChange={(e) => handleEventChange(index, record.key, "event", e)}
                >
                    <Select.Option value="push">Push</Select.Option>
                    <Select.Option value="pull_request">Pull Request</Select.Option>
                </Select>
            ),
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
            render: (text, record, index) => (
                <Input
                    placeholder="List of regex to match aginst branch names"
                    name="branch"
                    value = {record.branch}
                    onChange={(e) => handleEventChange(index, record.key, e.target.name, e.target.value)}></Input>
            ),
        },
        {
            title: "File",
            dataIndex: "file",
            key: "file",
            width: "45%",
            render: (text, record, index) => (
                <Input
                    placeholder="List of regex to match aginst changed files"
                    name="file"
                    value = {record.file}
                    onChange={(e) => handleEventChange(index, record.key, e.target.name, e.target.value)}></Input>
            ),
        },
        {
            title: "Template",
            dataIndex: "template",
            key: "template",
            width: "12%",
            render: (text, record, index) => (
                <Select
                    placeholder="Select a template"
                    value = {record.template}
                    onChange={(e) => handleEventChange(index, record.key, "template", e)}
                >
                    {orgTemplates.map(function (template, index) {
                        return (
                            <Select.Option key={template?.id}>
                                {template?.attributes?.name}
                            </Select.Option>
                        );
                    })}
                </Select>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: "8%",
            render: (text, record) => (
                <Space size="middle">
                    <Popconfirm
                        onConfirm={() => {
                            onDelete(record);
                        }}
                        style={{ width: "20px" }}
                        title={
                            <p>
                                This will permanently delete this trigger from the webhook<br />
                                Are you sure?
                            </p>
                        }
                        okText="Yes"
                        cancelText="No"
                        disabled={!manageWorkspace}
                    >
                        <a>Delete</a>
                    </Popconfirm>
                </Space>
            ),
        }
    ]

    return (
        <div>
            <h1>Webhook</h1>
            <p>
                Webhooks allow you to trigger a workspace run when a specific event occurs in the repository. This only works with VCS flow workspace.
            </p>
            <Spin spinning={waiting}>
                <Form
                    onFinish={onFinish}
                >
                    <Form.Item
                        label="Enable VCS Webhook?"
                        hidden={vcsProvider == ""}
                        tooltip={{
                            title: "Whether to enable webhook on the VCS provider",
                            icon: <InfoCircleOutlined />,
                        }}
                    >
                        <Switch onChange={handleWebhookClick} checked={webhookEnabled} disabled={!manageWorkspace} />
                    </Form.Item>
                    <Row hidden={!webhookEnabled}>
                        <Col span={12}>
                            <Form.Item label="ID" hidden={!webhookEnabled}>
                                {webhookId}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item hidden={!webhookEnabled} label={renderVCSLogo(vcsProvider)}>
                                {remoteHookId}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row hidden={!webhookEnabled}>
                        <Col span={24}>
                            <Table
                                tableLayout="auto"
                                columns={columns}
                                dataSource={webhookEvents}
                                hidden={!webhookEnabled} />
                        </Col>
                    </Row>
                    <Form.Item>
                        <Flex justify="center" align="flex-start">
                            <Button type="primary" htmlType="submit" disabled={!manageWorkspace}>
                                Save webhooks
                            </Button>
                        </Flex>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
}