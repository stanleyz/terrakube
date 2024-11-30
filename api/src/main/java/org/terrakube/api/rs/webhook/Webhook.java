package org.terrakube.api.rs.webhook;

import java.sql.Types;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.terrakube.api.plugin.security.audit.GenericAuditFields;
import org.terrakube.api.rs.IdConverter;
import org.terrakube.api.rs.hooks.webhook.WebhookManageHook;
import org.terrakube.api.rs.workspace.Workspace;

import com.yahoo.elide.annotation.Include;
import com.yahoo.elide.annotation.LifeCycleHookBinding;

import lombok.Getter;
import lombok.Setter;

@Include
@Getter
@Setter
@LifeCycleHookBinding(operation = LifeCycleHookBinding.Operation.CREATE, phase = LifeCycleHookBinding.TransactionPhase.PRECOMMIT, hook = WebhookManageHook.class)
@LifeCycleHookBinding(operation = LifeCycleHookBinding.Operation.DELETE, phase = LifeCycleHookBinding.TransactionPhase.POSTCOMMIT, hook = WebhookManageHook.class)
@Entity(name = "webhook")
public class Webhook extends GenericAuditFields{

    @Id
    @JdbcTypeCode(Types.VARCHAR)
    @Convert(converter = IdConverter.class)
    private UUID id;

    @Column(name="remote_hook_id")
    private String remoteHookId;
    
    private String branch;
    
    private String path;
    
    @Column(name="template_id")
    private String templateId;

    @Enumerated(EnumType.STRING)
    private WebhookEvent event;
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Workspace workspace;

    public void setEvent(String event) {
        try {
            this.event = WebhookEvent.valueOf(event.toUpperCase()); // Converts the string to the enum
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid value for event. Allowed values are 'PUSH' and 'PULL_REQUEST'.");
        }
    }
}

