import {
    Table,
    Space,
    Popconfirm,
    Spin,
    Form,
} from "antd";
import { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";

export const WorkspaceWebhook = ({ workspace, manageWorkspace }) => {
    const [waiting, setWaiting] = useState(true);
    const organizationId = workspace.relationships.organization.data.id;
    const webhookId = workspace.relationships.webhook.data.id;
    const workspaceId = workspace.id;

    useEffect(() => {
        setWaiting(true);
        loadWebhook();
        setWaiting(false);
    });
    const loadWebhook = () => {
        axiosInstance.get(`organization/${organizationId}/workspace/${workspaceId}/webhook/${webhookId}/events`).then((response) => {
            console.log(response);
            if (response.status === 200) {
                console.log(response);
            }
        });
    };
    const onDelete = (id) => {
    };
    const columns = [
        {
            title: "Event",
            dataIndex: "event",
            key: "event",
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
        },
        {
            title: "Folder",
            dataIndex: "folder",
            key: "folder",
        },
        {
            title: "Template",
            dataIndex: "template",
            key: "template",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => (
                <Space size="middle">
                    <Popconfirm
                        onConfirm={() => {
                            onDelete(record.id);
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

    const data = [
        {
            key: '1',
            event: 'push',
            branch: 'master',
            folder: 'root',
            template: 'Terraform',
        },
        {
            key: '2',
            event: 'push',
            branch: 'master',
            folder: 'root',
            template: 'Terraform',
        },
        {
            key: '3',
            event: 'push',
            branch: 'master',
            folder: 'root',
            template: 'Terraform',
        },
    ];

    return (
        <div>
            <h1>Webhook</h1>
            <div className="App-Text">
                Webhooks allow you to trigger a workspace run when a specific event occurs in the repository.
            </div>
            <Spin spinning={waiting}>
                <Form>
                    <Form.Item name="id" label="ID">
                    </Form.Item>
                    <Form.Item name="remote_hook_id" label="Hook ID">
                    </Form.Item>
                    <Table columns={columns} dataSource={data} />
                </Form>
            </Spin>
        </div>
    );
}